import { NextResponse } from "next/server";

const API = process.env.NEXT_PUBLIC_API_URL ?? "http://127.0.0.1:8000/api/v1";

export async function GET(_request:Request,{params}:{params:Promise<{slug:string}>}){
  const {slug}=await params;
  if(!/^[a-z0-9]+(?:-[a-z0-9]+)*$/i.test(slug)) return NextResponse.json({detail:"Not found"},{status:404});
  try{
    const response=await fetch(`${API}/alumni/${encodeURIComponent(slug)}/`,{cache:"no-store",headers:{Accept:"application/json"}});
    if(!response.ok) return NextResponse.json({detail:response.status===404?"Not found":"Profile request failed"},{status:response.status});
    return NextResponse.json(await response.json());
  }catch{
    return NextResponse.json({detail:"Profile service unavailable"},{status:502});
  }
}
