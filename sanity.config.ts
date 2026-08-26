"use client";

import { defineConfig } from "sanity";
import { structureTool, type StructureBuilder } from "sanity/structure";
import { visionTool } from "@sanity/vision";
import { schemaTypes } from "./src/sanity/schemaTypes";
import { DeleteWaitlistSubscriberAction } from "./src/sanity/actions/deleteWaitlistSubscriberAction";

const singletonPage = (
  S: StructureBuilder,
  title: string,
  schemaType: string,
  documentId: string,
) =>
  S.listItem()
    .title(title)
    .child(
      S.document().title(title).schemaType(schemaType).documentId(documentId),
    );

export default defineConfig({
  name: "default",
  title: "Ivory Muse Content",
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || "aaaaaaaa",
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || "production",
  basePath: "/studio",
  plugins: [
    structureTool({
      structure: (S) =>
        S.list()
          .title("Content")
          .items([
            S.listItem()
              .title("Global settings")
              .child(
                S.list()
                  .title("Global settings")
                  .items([
                    singletonPage(
                      S,
                      "Default settings",
                      "siteSettings",
                      "siteSettings",
                    ),
                    singletonPage(
                      S,
                      "Header",
                      "headerSettings",
                      "headerSettings",
                    ),
                    singletonPage(
                      S,
                      "Footer",
                      "footerSettings",
                      "footerSettings",
                    ),
                  ]),
              ),
            S.divider(),
            S.listItem()
              .title("Pages")
              .child(
                S.list()
                  .title("Pages")
                  .items([
                    singletonPage(S, "Home page", "homePage", "homePage"),
                    singletonPage(S, "About page", "aboutPage", "aboutPage"),
                    singletonPage(
                      S,
                      "Collection page",
                      "collectionPage",
                      "collectionPage",
                    ),
                    singletonPage(
                      S,
                      "Product details page",
                      "productPage",
                      "productPage",
                    ),
                    singletonPage(S, "FAQ page", "faqPage", "faqPage"),
                    singletonPage(
                      S,
                      "Contact page",
                      "contactPage",
                      "contactPage",
                    ),
                    singletonPage(S, "Blog page", "blogPage", "blogPage"),
                    singletonPage(
                      S,
                      "Article page settings",
                      "articlePage",
                      "articlePage",
                    ),
                  ]),
              ),
            S.divider(),
            S.listItem()
              .title("Account")
              .child(
                S.list()
                  .title("Account")
                  .items([
                    singletonPage(
                      S,
                      "Navigation",
                      "accountNavigation",
                      "accountNavigation",
                    ),
                    singletonPage(
                      S,
                      "Login page",
                      "accountLoginPage",
                      "accountLoginPage",
                    ),
                    singletonPage(
                      S,
                      "Registration page",
                      "accountRegisterPage",
                      "accountRegisterPage",
                    ),
                    singletonPage(
                      S,
                      "Password recovery page",
                      "accountRecoveryPage",
                      "accountRecoveryPage",
                    ),
                    singletonPage(
                      S,
                      "Dashboard page",
                      "accountDashboardPage",
                      "accountDashboardPage",
                    ),
                    singletonPage(
                      S,
                      "Profile page",
                      "accountProfilePage",
                      "accountProfilePage",
                    ),
                    singletonPage(
                      S,
                      "Orders page",
                      "accountOrdersPage",
                      "accountOrdersPage",
                    ),
                    singletonPage(
                      S,
                      "Order details page",
                      "accountOrderDetailsPage",
                      "accountOrderDetailsPage",
                    ),
                    singletonPage(
                      S,
                      "Addresses page",
                      "accountAddressesPage",
                      "accountAddressesPage",
                    ),
                  ]),
              ),
            S.divider(),
            S.documentTypeListItem("waitlistSubscriber").title(
              "Waitlist subscribers",
            ),
          ]),
    }),
    visionTool(),
  ],
  schema: { types: schemaTypes },
  document: {
    actions: (previousActions, context) =>
      context.schemaType === "waitlistSubscriber"
        ? [...previousActions, DeleteWaitlistSubscriberAction]
        : previousActions,
  },
});
