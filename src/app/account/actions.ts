"use server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { customerAccountFetch, decodeCustomerId } from "@/lib/customer-account/client";

type MutationResult = { userErrors: Array<{ field?: string[]; message: string }> };
const fields = ["firstName","lastName","company","address1","address2","city","zoneCode","territoryCode","zip","phoneNumber"] as const;
function addressFrom(formData: FormData) {
  return Object.fromEntries(fields.map((field) => [field, String(formData.get(field) || "").trim()]).filter(([,value]) => value));
}
function message(error: unknown) { return error instanceof Error ? error.message : "Address could not be saved"; }
function destination(type: "success"|"error", value: string) { return `/account/addresses?${type}=${encodeURIComponent(value)}`; }

export async function saveAddress(formData: FormData) {
  const encodedId = String(formData.get("id") || "");
  const address = addressFrom(formData);
  const defaultAddress = formData.get("defaultAddress") === "on";
  if (!address.address1 || !address.city || !address.territoryCode || !address.zip) redirect(destination("error", "Address, city, country code and postal code are required."));
  let next: string;
  try {
    if (encodedId) {
      const data = await customerAccountFetch<{customerAddressUpdate:MutationResult}>(`mutation UpdateAddress($addressId: ID!, $address: CustomerAddressInput!, $defaultAddress: Boolean) { customerAddressUpdate(addressId:$addressId,address:$address,defaultAddress:$defaultAddress){userErrors{field message}} }`,{addressId:decodeCustomerId(encodedId),address,defaultAddress});
      const error = data.customerAddressUpdate.userErrors[0];
      next = error ? destination("error",error.message) : destination("success","Address updated.");
    } else {
      const data = await customerAccountFetch<{customerAddressCreate:MutationResult}>(`mutation CreateAddress($address: CustomerAddressInput!, $defaultAddress: Boolean) { customerAddressCreate(address:$address,defaultAddress:$defaultAddress){userErrors{field message}} }`,{address,defaultAddress});
      const error = data.customerAddressCreate.userErrors[0];
      next = error ? destination("error",error.message) : destination("success","Address added.");
    }
  } catch (error) { next = destination("error",message(error)); }
  revalidatePath("/account"); revalidatePath("/account/addresses"); redirect(next);
}

export async function deleteAddress(formData: FormData) {
  let next: string;
  try {
    const addressId=decodeCustomerId(String(formData.get("id")||""));
    const data=await customerAccountFetch<{customerAddressDelete:MutationResult}>(`mutation DeleteAddress($addressId:ID!){customerAddressDelete(addressId:$addressId){userErrors{field message}}}`,{addressId});
    const error=data.customerAddressDelete.userErrors[0];
    next=error?destination("error",error.message):destination("success","Address deleted.");
  } catch(error){next=destination("error",message(error));}
  revalidatePath("/account");revalidatePath("/account/addresses");redirect(next);
}

export async function setDefaultAddress(formData:FormData){
  let next:string;
  try{const addressId=decodeCustomerId(String(formData.get("id")||""));const data=await customerAccountFetch<{customerAddressUpdate:MutationResult}>(`mutation DefaultAddress($addressId:ID!){customerAddressUpdate(addressId:$addressId,defaultAddress:true){userErrors{field message}}}`,{addressId});const error=data.customerAddressUpdate.userErrors[0];next=error?destination("error",error.message):destination("success","Default address updated.");}catch(error){next=destination("error",message(error));}
  revalidatePath("/account");revalidatePath("/account/addresses");redirect(next);
}
