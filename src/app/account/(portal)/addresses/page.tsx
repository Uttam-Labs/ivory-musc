import Link from "next/link";
import {
  customerAccountFetch,
  decodeCustomerId,
  encodeCustomerId,
} from "@/lib/customer-account/client";
import { ADDRESSES_QUERY } from "@/lib/customer-account/queries";
import { getAccountContent } from "@/lib/customer-account/content";
import {
  deleteAddress,
  saveAddress,
  setDefaultAddress,
} from "../../storefront-actions";
import styles from "../../account.module.css";
import { ConfirmSubmitButton } from "../../confirm-submit-button";
type Address = {
  id: string;
  firstName?: string;
  lastName?: string;
  company?: string;
  address1?: string;
  address2?: string;
  city?: string;
  province?: string;
  country?: string;
  zip?: string;
  phone?: string;
  formatted: string[];
};
type Data = {
  customer: {
    defaultAddress?: { id: string };
    addresses: { nodes: Address[] };
  };
};
export async function generateMetadata() {
  const content = await getAccountContent<Record<string, string>>(
    "accountAddressesPage",
  );
  return { title: content.seoTitle || "Addresses | Ivory Muse" };
}
export default async function AddressesPage({
  searchParams,
}: {
  searchParams: Promise<{ edit?: string; success?: string; error?: string }>;
}) {
  const [{ customer }, params, cms] = await Promise.all([
    customerAccountFetch<Data>(ADDRESSES_QUERY),
    searchParams,
    getAccountContent<Record<string, string>>("accountAddressesPage"),
  ]);
  const c = {
    eyebrow: "Address book",
    heading: "Your addresses",
    defaultLabel: "Default",
    editLabel: "Edit",
    setDefaultLabel: "Set default",
    deleteLabel: "Delete",
    editHeading: "Edit address",
    addHeading: "Add a new address",
    firstNameLabel: "First name",
    lastNameLabel: "Last name",
    companyLabel: "Company",
    phoneLabel: "Phone (+country code)",
    address1Label: "Address",
    address2Label: "Apartment, suite, etc.",
    cityLabel: "City",
    provinceLabel: "State / province",
    countryLabel: "Country",
    postalCodeLabel: "Postal code",
    defaultAddressLabel: "Set as default address",
    saveLabel: "Save changes",
    addLabel: "Add address",
    cancelLabel: "Cancel",
    confirmUpdateMessage: "Save these changes to your address?",
    confirmDefaultMessage: "Make this your default delivery address?",
    confirmDeleteMessage: "Delete this address? This action cannot be undone.",
    ...cms,
  };
  let edit: Address | undefined;
  if (params.edit) {
    try {
      const addressId = decodeCustomerId(params.edit);
      edit = customer.addresses.nodes.find(
        (address) => address.id === addressId,
      );
    } catch {
      edit = undefined;
    }
  }
  return (
    <>
      <header className={styles.header}>
        <div>
          <p className={styles.eyebrow}>{c.eyebrow}</p>
          <h1 className={styles.title}>{c.heading}</h1>
        </div>
      </header>
      {params.success && <p className={styles.notice}>{params.success}</p>}
      {params.error && (
        <p className={`${styles.notice} ${styles.error}`}>{params.error}</p>
      )}
      <div className={styles.addressGrid}>
        {customer.addresses.nodes.map((address) => {
          const id = encodeCustomerId(address.id);
          const isDefault = customer.defaultAddress?.id === address.id;
          return (
            <article className={styles.address} key={address.id}>
              {isDefault && (
                <span className={styles.badge}>{c.defaultLabel}</span>
              )}
              {address.formatted.map((line) => (
                <p key={line}>{line}</p>
              ))}
              <div className={styles.inlineActions}>
                <Link
                  className={styles.secondary}
                  href={`/account/addresses?edit=${id}#address-form`}
                >
                  {c.editLabel}
                </Link>
                {!isDefault && (
                  <form action={setDefaultAddress}>
                    <input type="hidden" name="id" value={id} />
                    <ConfirmSubmitButton
                      className={styles.secondary}
                      message={c.confirmDefaultMessage}
                    >
                      {c.setDefaultLabel}
                    </ConfirmSubmitButton>
                  </form>
                )}
                <form action={deleteAddress}>
                  <input type="hidden" name="id" value={id} />
                  <ConfirmSubmitButton
                    className={styles.danger}
                    message={c.confirmDeleteMessage}
                  >
                    {c.deleteLabel}
                  </ConfirmSubmitButton>
                </form>
              </div>
            </article>
          );
        })}
      </div>
      <article
        className={styles.card}
        id="address-form"
        style={{ marginTop: "2rem" }}
      >
        <h2>{edit ? c.editHeading : c.addHeading}</h2>
        <form
          key={edit?.id || "new-address"}
          className={styles.form}
          action={saveAddress}
        >
          {edit && (
            <input type="hidden" name="id" value={encodeCustomerId(edit.id)} />
          )}
          <Field
            name="firstName"
            label={c.firstNameLabel}
            value={edit?.firstName}
          />
          <Field
            name="lastName"
            label={c.lastNameLabel}
            value={edit?.lastName}
          />
          <Field name="company" label={c.companyLabel} value={edit?.company} />
          <Field name="phone" label={c.phoneLabel} value={edit?.phone} />
          <Field
            full
            name="address1"
            label={c.address1Label}
            value={edit?.address1}
            required
          />
          <Field
            full
            name="address2"
            label={c.address2Label}
            value={edit?.address2}
          />
          <Field name="city" label={c.cityLabel} value={edit?.city} required />
          <Field
            name="province"
            label={c.provinceLabel}
            value={edit?.province}
          />
          <Field
            name="country"
            label={c.countryLabel}
            value={edit?.country || "Australia"}
            required
          />
          <Field
            name="zip"
            label={c.postalCodeLabel}
            value={edit?.zip}
            required
          />
          <label className={`${styles.check} ${styles.full}`}>
            <input
              type="checkbox"
              name="defaultAddress"
              defaultChecked={
                customer.addresses.nodes.length === 0 ||
                Boolean(edit && customer.defaultAddress?.id === edit.id)
              }
            />{" "}
            {c.defaultAddressLabel}
          </label>
          <div
            className={`${styles.actions} ${styles.full}`}
            style={{ justifyContent: "flex-start" }}
          >
            {edit ? (
              <ConfirmSubmitButton
                className={styles.primary}
                message={c.confirmUpdateMessage}
              >
                {c.saveLabel}
              </ConfirmSubmitButton>
            ) : (
              <button className={styles.primary}>{c.addLabel}</button>
            )}
            {edit && (
              <Link className={styles.secondary} href="/account/addresses">
                {c.cancelLabel}
              </Link>
            )}
          </div>
        </form>
      </article>
    </>
  );
}
function Field({
  name,
  label,
  value,
  required,
  full,
}: {
  name: string;
  label: string;
  value?: string;
  required?: boolean;
  full?: boolean;
}) {
  return (
    <div className={`${styles.field} ${full ? styles.full : ""}`}>
      <label htmlFor={name}>{label}</label>
      <input
        id={name}
        name={name}
        defaultValue={value || ""}
        required={required}
      />
    </div>
  );
}
