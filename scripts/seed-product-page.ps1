$ErrorActionPreference = "Stop"
$config = @{}
Get-Content ".env" | ForEach-Object {
  if ($_ -match '^([^#=]+)=(.*)$') { $config[$matches[1].Trim()] = $matches[2].Trim() }
}
$headers = @{ Authorization = "Bearer $($config.SANITY_API_READ_TOKEN)" }
$document = @{
  _id = "productPage"
  _type = "productPage"
  title = "Product page"
  sections = @(
    @{
      _key = "product-details"
      _type = "productDetailsSettings"
      homeLabel = "Home"
      homeHref = "/"
      collectionLabel = "Collections"
      collectionHref = "/collections/shop"
      perUnitLabel = "per meter"
      quantityLabel = "Meter"
      totalLabel = "Total:"
      minimumPurchaseText = "(Minimum purchase: 1 metre)"
      buyNowLabel = "BUY NOW"
      addToCartLabel = "ADD TO CART"
      purchaseSampleLabel = "PURCHASE SAMPLE"
      purchaseSampleHref = "/contact"
      shippingText = "Free shipping on orders over `$300 · Ships in 2–3 business days"
      specificationsHeading = "Fabric specifications"
      compositionLabel = "Composition"
      weightLabel = "Weight"
      widthLabel = "Width"
      careLabel = "Care"
    },
    @{
      _key = "related-products"
      _type = "relatedProductsSettings"
      heading = "RELATED PRODUCTS"
      productLimit = 4
    }
  )
}
$payload = @{ mutations = @(@{ createOrReplace = $document }) } | ConvertTo-Json -Depth 20 -Compress
$url = "https://$($config.NEXT_PUBLIC_SANITY_PROJECT_ID).api.sanity.io/v2025-02-19/data/mutate/$($config.NEXT_PUBLIC_SANITY_DATASET)"
$result = Invoke-RestMethod -Method Post -Uri $url -Headers $headers -ContentType "application/json" -Body ([Text.Encoding]::UTF8.GetBytes($payload))
Write-Output "Product page settings created: $($result.results.Count) document."
