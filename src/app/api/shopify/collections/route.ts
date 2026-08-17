import {NextResponse} from "next/server";
import {getCollections} from "@/lib/shopify";
import {isShopifyConfigured} from "@/lib/env";
export async function GET(){if(!isShopifyConfigured)return NextResponse.json({collections:[]});try{const collections=await getCollections(100);return NextResponse.json({collections:collections.map(({id,title,handle})=>({id,title,handle}))})}catch{return NextResponse.json({error:"Collections could not be loaded"},{status:502})}}
