$ErrorActionPreference = "Stop"
$config = @{}
Get-Content ".env" | ForEach-Object {
  if ($_ -match '^([^#=]+)=(.*)$') { $config[$matches[1].Trim()] = $matches[2].Trim() }
}
$headers = @{ Authorization = "Bearer $($config.SANITY_API_READ_TOKEN)" }
$document = @{
  _id = "faqPage"
  _type = "faqPage"
  title = "Frequently Asked Questions"
  seoDescription = "Answers to frequently asked questions about Ivory Muse orders, delivery, changes, cancellations and refunds."
  sections = @(
    @{
      _key = "faq-hero"
      _type = "faqHero"
      heading = "Frequently Asked Questions"
      body = "Ivory Muse was born from a belief that the finest fabric should be accessible to those who truly understand it."
      overlayOpacity = 18
    },
    @{
      _key = "faq-list"
      _type = "faqAccordion"
      heading = "FAQ"
      defaultOpenItem = 1
      items = @(
        @{ _key = "order-confirmation"; _type = "object"; question = "How do I know my order has been successfully placed?"; answer = "You will receive a confirmation email at your registered email address once your order has been placed successfully. You can check your order details by clicking the link in the email." },
        @{ _key = "track-order"; _type = "object"; question = "How do I track my order?"; answer = "Once your order has been dispatched, we will send you a shipping confirmation email containing your tracking details and a link to follow the delivery." },
        @{ _key = "modify-order"; _type = "object"; question = "Can I modify my order once my order is successfully placed?"; answer = "Please contact us as soon as possible after placing your order. We will do our best to assist before processing begins, but changes cannot be guaranteed once the order has been prepared or dispatched." },
        @{ _key = "change-address"; _type = "object"; question = "How do I change my address?"; answer = "Contact our customer care team immediately with your order number and the correct delivery address. An address cannot be changed after the parcel has been dispatched." },
        @{ _key = "cancel-order"; _type = "object"; question = "How do I cancel my order?"; answer = "Please contact our customer care team promptly with your order number. If your order has not entered processing or dispatch, we will confirm whether cancellation is possible." },
        @{ _key = "refund-order"; _type = "object"; question = "How will I get my refund if I cancel my order?"; answer = "Approved refunds are returned to the original payment method. Processing times vary by payment provider and may take several business days to appear in your account." }
      )
    },
    @{
      _key = "faq-cta"
      _type = "faqCta"
      heading = "Where Exceptional Retailers Meet Exceptional Craftsmanship"
      body = "Partner with us to offer your customers ethically sourced, premium silk and luxury fabrics crafted with exceptional quality and timeless elegance."
      buttonLabel = "Explore Products"
      buttonHref = "/collections/shop"
      overlayOpacity = 25
    }
  )
}
$payload = @{ mutations = @(@{ createOrReplace = $document }) } | ConvertTo-Json -Depth 30 -Compress
$url = "https://$($config.NEXT_PUBLIC_SANITY_PROJECT_ID).api.sanity.io/v2025-02-19/data/mutate/$($config.NEXT_PUBLIC_SANITY_DATASET)"
$result = Invoke-RestMethod -Method Post -Uri $url -Headers $headers -ContentType "application/json" -Body ([Text.Encoding]::UTF8.GetBytes($payload))
Write-Output "FAQ page settings created: $($result.results.Count) document."
