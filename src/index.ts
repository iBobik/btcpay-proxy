const pathsPrefixWhitelist = [
  '/img/',
  '/invoice',
  '/fonts/',
  '/imlegacy/',
  '/misc/translations/',
  '/checkout/',
  '/main/',
  '/js/',
  '/vendor/',
  '/modal/',
  '/api/v1/invoices',
]
// TODO: Implement websocket proxy '/invoice/status/ws'

const textTypes = [
  'text/',
  'application/json',
  'application/xml',
  'application/javascript',
  'application/ld+json',
]


export default {
  async fetch(request, env, ctx): Promise<Response> {
    if (!env.BTCPAY_ORIGIN) throw new Error('BTCPAY_ORIGIN is not set')
    const originUrl = new URL(env.BTCPAY_ORIGIN)

    const url = new URL(request.url)
    const currentHost = url.host

    if (!pathsPrefixWhitelist.some((path) => url.pathname.startsWith(path))) {
      return new Response('Access denied', { status: 403 })
    }

    url.host = originUrl.host
    url.port = originUrl.port
    url.protocol = originUrl.protocol

    const response = await fetch(url.toString(), request)

    const contentType = response.headers.get("Content-Type")
    if (contentType && textTypes.some((type) => contentType.includes(type))) {
      console.log('Replacing text in response', originUrl.host, currentHost)
      const originalText = await response.text()
      const newText = originalText.replaceAll(originUrl.host, currentHost)
      return new Response(newText, {
        status: response.status,
        statusText: response.statusText,
        headers: response.headers
      })
    }

    return response
  },
} satisfies ExportedHandler<Env>
