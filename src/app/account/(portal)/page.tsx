import Link from "next/link";
import { customerAccountFetch, encodeCustomerId } from "@/lib/customer-account/client";
import { ACCOUNT_QUERY } from "@/lib/customer-account/queries";
import { formatMoney } from "@/lib/format";
import styles from "../account.module.css";
type Money={amount:string;currencyCode:string}; type Address={formatted:string[]}; type Order={id:string;name:string;processedAt:string;financialStatus:string;fulfillmentStatus:string;totalPrice:Money};
type Data={customer:{displayName:string;emailAddress?:{emailAddress:string};defaultAddress?:Address;orders:{nodes:Order[]}}};
export const metadata={title:"My account | Ivory Muse"};
export default async function AccountPage(){const {customer}=await customerAccountFetch<Data>(ACCOUNT_QUERY);return <><header className={styles.header}><div><p className={styles.eyebrow}>My account</p><h1 className={styles.title}>Hello, {customer.displayName}</h1><p className={styles.muted}>{customer.emailAddress?.emailAddress}</p></div></header><div className={styles.grid}><article className={styles.card}><h2>Default address</h2>{customer.defaultAddress?customer.defaultAddress.formatted.map(line=><p key={line}>{line}</p>):<p className={styles.muted}>No address saved yet.</p>}<Link className={styles.back} href="/account/addresses">Manage addresses</Link></article><article className={styles.card}><h2>Recent orders</h2>{customer.orders.nodes.length?customer.orders.nodes.map(order=><p key={order.id}><Link href={`/account/orders/${encodeCustomerId(order.id)}`}>{order.name}</Link> · {formatMoney(order.totalPrice)}</p>):<p className={styles.muted}>You have not placed an order yet.</p>}<Link className={styles.back} href="/account/orders">View all orders</Link></article></div></>}
