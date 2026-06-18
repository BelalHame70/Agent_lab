import { NextRequest, NextResponse } from "next/server"

const BACKEND = "https://apinodejssecure-production.up.railway.app"

async function handler(req: NextRequest) {
  const url    = req.nextUrl.pathname.replace(/^\/api\/v1/, "")
  const search = req.nextUrl.search
  const target = `${BACKEND}/api/v1${url}${search}`

  const headers: Record<string, string> = {}

  const ct = req.headers.get("content-type")
  if (ct) headers["Content-Type"] = ct

  const auth = req.headers.get("authorization")
  if (auth) headers["Authorization"] = auth


  const cookie = req.headers.get("cookie")
  if (cookie) headers["Cookie"] = cookie

  const hasBody = !["GET", "HEAD"].includes(req.method)
  let body: string | FormData | undefined

  if (hasBody) {
    if (ct?.includes("multipart/form-data")) {
      
      const formData = await req.formData()
      const newForm = new FormData()
      for (const [key, value] of formData.entries()) {
        newForm.append(key, value)
      }
      body = newForm
    
      delete headers["Content-Type"]
    } else {
      body = await req.text()
    }
  }

  const res = await fetch(target, {
    method: req.method,
    headers,
    body,
  })

  const resText = await res.text()
  const resHeaders = new Headers()

  
  const resCt = res.headers.get("content-type")
  if (resCt) resHeaders.set("Content-Type", resCt)

  const setCookie = res.headers.get("set-cookie")
  if (setCookie) resHeaders.set("Set-Cookie", setCookie)

  return new NextResponse(resText, {
    status: res.status,
    headers: resHeaders,
  })
}

export {
  handler as GET,
  handler as POST,
  handler as PUT,
  handler as DELETE,
  handler as PATCH,
}