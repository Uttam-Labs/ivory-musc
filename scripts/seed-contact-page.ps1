$ErrorActionPreference = "Stop"
$config = @{}
Get-Content ".env" | ForEach-Object {
  if ($_ -match '^([^#=]+)=(.*)$') { $config[$matches[1].Trim()] = $matches[2].Trim() }
}
$headers = @{ Authorization = "Bearer $($config.SANITY_API_READ_TOKEN)" }
$document = @{
  _id = "contactPage"
  _type = "contactPage"
  title = "Contact Us"
  seoDescription = "Contact Ivory Muse for help with premium silk fabrics, orders and general enquiries."
  sections = @(
    @{ _key = "contact-hero"; _type = "contactHero"; heading = "Contact Us"; body = "Ivory Muse was born from a belief that the finest fabric should be accessible to those who truly understand it."; overlayOpacity = 15 },
    @{ _key = "contact-form"; _type = "contactFormSection"; heading = "Get in Touch"; body = "Fill in the form below and a member of our team will get back to you within one business day."; firstNameLabel = "First Name"; lastNameLabel = "Last Name"; emailLabel = "Email Address"; phoneLabel = "Phone Number"; messageLabel = "Ask Us Anything"; submitLabel = "Submit"; successMessage = "Thank you. Your message has been received and our team will contact you shortly."; errorMessage = "Your message could not be sent. Please check the form and try again." }
  )
}
$payload = @{ mutations = @(@{ createOrReplace = $document }) } | ConvertTo-Json -Depth 20 -Compress
$url = "https://$($config.NEXT_PUBLIC_SANITY_PROJECT_ID).api.sanity.io/v2025-02-19/data/mutate/$($config.NEXT_PUBLIC_SANITY_DATASET)"
$result = Invoke-RestMethod -Method Post -Uri $url -Headers $headers -ContentType "application/json" -Body ([Text.Encoding]::UTF8.GetBytes($payload))
Write-Output "Contact page settings created: $($result.results.Count) document."
