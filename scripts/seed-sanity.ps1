$ErrorActionPreference = "Stop"
$config = @{}
Get-Content ".env" | ForEach-Object { if ($_ -match '^([^#=]+)=(.*)$') { $config[$matches[1].Trim()] = $matches[2].Trim() } }
$token = $config.SANITY_API_READ_TOKEN
$project = $config.NEXT_PUBLIC_SANITY_PROJECT_ID
$dataset = $config.NEXT_PUBLIC_SANITY_DATASET
$headers = @{ Authorization = "Bearer $token" }

$files = @{
  hero="hero.jpg"; story="story.jpg"; newsletter="newsletter.jpg"; campaign="campaign.jpg"; craftsmanship="craftsmanship.jpg"; logo="logo.jpg"
  mulberry="mulberry.png"; quality="quality.png"; retail="retail.png"; wholesale="wholesale.png"; certification="certification.png"; shipping="shipping.png"
}
$assets = @{}
foreach ($name in $files.Keys) {
  $path = Join-Path "public\figma" $files[$name]
  $mime = if ($path.EndsWith(".png")) { "image/png" } else { "image/jpeg" }
  $url = "https://$project.api.sanity.io/v2025-02-19/assets/images/$($dataset)?filename=$([uri]::EscapeDataString($files[$name]))"
  $upload = Invoke-RestMethod -Method Post -Uri $url -Headers $headers -ContentType $mime -InFile $path
  $assets[$name] = $upload.document._id
}
function ImageRef($name, $alt) { return @{ _type="image"; asset=@{ _type="reference"; _ref=$assets[$name] }; alt=$alt } }

$settings = @{
  _id="siteSettings"; _type="siteSettings"; title="Ivory Muse"
  description="Premium silk fabrics, thoughtfully curated for designers, dressmakers and creators."
  logo=(ImageRef "logo" "Ivory Muse")
  navigation=@(
    @{_key="home";label="Home";href="/"}, @{_key="shop";label="Shop";href="/collections"}, @{_key="guide";label="Silk Guide";href="/silk-guide"},
    @{_key="about";label="About";href="/about"}, @{_key="contact";label="Contact";href="/contact"}, @{_key="blog";label="Blog";href="/blog"}
  )
  contactEmail="ivorymuse25@gmail.com"
  footerColumns=@(
    @{_key="quick";heading="Quick Links";links=@(@{_key="h";label="Home";href="/"},@{_key="a";label="About";href="/about"},@{_key="s";label="Shop";href="/collections"},@{_key="c";label="Contact";href="/contact"},@{_key="g";label="Silk Guide";href="/silk-guide"})},
    @{_key="care";heading="Customer Care";links=@(@{_key="sh";label="Shipping";href="/shipping"},@{_key="r";label="Returns";href="/returns"},@{_key="p";label="Privacy Policy";href="/privacy"},@{_key="t";label="Terms & Conditions";href="/terms"},@{_key="f";label="FAQ";href="/faq"})}
  )
  copyright="Ivory Muse. All Rights Reserved (c) 2026"
  theme=@{headingFont="Cormorant Garamond";bodyFont="Montserrat";background="#fbf4ec";foreground="#423732";accent="#a85650";surface="#fffaf5"}
}
$features = @(
  @{_key="mulberry";title="100% Mulberry Silk";icon=(ImageRef "mulberry" "")}, @{_key="quality";title="Premium Quality";icon=(ImageRef "quality" "")},
  @{_key="retail";title="Retail";icon=(ImageRef "retail" "")}, @{_key="wholesale";title="Wholesale Soon";icon=(ImageRef "wholesale" "")},
  @{_key="certification";title="OEKO-TEX Certification";icon=(ImageRef "certification" "")}, @{_key="shipping";title="Australia-Wide Shipping";icon=(ImageRef "shipping" "")}
)
$homeDoc = @{
  _id="homePage"; _type="homePage"; title="Home"
  sections=@(
    @{_key="hero";_type="hero";heading="Exceptional Materials Matter Most";body="At Ivory Muse, we thoughtfully curate silk fabrics chosen for their beauty, quality and performance, giving designers, dressmakers and creators the confidence to bring their ideas to life.";image=(ImageRef "hero" "Flowing ivory silk");buttonLabel="Shop the Collection";buttonHref="/collections"},
    @{_key="chosen";_type="imageText";eyebrow="Silk, Chosen with Intention.";body="Choosing the right fabric is one of the most important decisions in the creative process.`n`nAt Ivory Muse, every fabric is selected with intention - chosen for its quality, beauty and performance. Rather than offering endless options, we curate a refined collection of premium silk fabrics that gives designers, dressmakers and creators the confidence to create something extraordinary.`n`nWe believe exceptional creations begin with exceptional materials, and every fabric in our collection reflects that belief.";image=(ImageRef "story" "Silk selection and design process");imagePosition="left";buttonLabel="Explore the Collection";buttonHref="/collections"},
    @{_key="bestseller";_type="collectionSlider";heading="Bestseller";intro="Every project begins with the right foundation."},
    @{_key="craft";_type="imageText";heading="Where Craftsmanship Meets Quiet Luxury";body="Fabrics remain crisp and light. Silhouettes have been shaped to shift fluidly with the form.";image=(ImageRef "craftsmanship" "Silk draped over natural stone");imagePosition="left";buttonLabel="Explore Products";buttonHref="/collections"},
    @{_key="story";_type="centeredStory";heading="Our Story Begins with a Simple Belief.";body="Ivory Muse was founded on the belief that every remarkable creation deserves an exceptional beginning.`n`nWe know that behind every garment is a vision. A designer sketching an idea. A dressmaker carefully planning every detail. A creator investing countless hours into bringing something meaningful to life.`n`nWe also know that the fabric they choose becomes the foundation of everything that follows. That understanding inspired Ivory Muse.`n`nRather than creating another fabric store with endless options, we set out to build a carefully curated destination where quality comes before quantity, where every silk is chosen with intention, and where creators can shop with confidence knowing every fabric has earned its place.";buttonLabel="Discover the Ivory Muse Story";buttonHref="/about"},
    @{_key="philosophy";_type="imageText";heading="Our Philosophy";body="This simple belief shapes every decision we make.`n`nFrom the fabrics we curate to the experience we create, everything is guided by one purpose: to help designers, dressmakers and creators begin every project with confidence.`n`nWe believe quality is more than a feature. It is a responsibility.`n`nIt is how we honour the trust our customers place in us every time they choose Ivory Muse.";image=(ImageRef "campaign" "Designer working with silk samples");imagePosition="left"},
    @{_key="guide";_type="featureGuide";heading="The Ultimate Silk Fabric Guide";body="From the smooth brilliance of Mulberry Silk to the airy elegance of Chiffon, discover the unique characteristics of every fabric and find the perfect choice for your next creation.";buttonLabel="View the Fabric Guide";buttonHref="/silk-guide";features=$features},
    @{_key="newsletter";_type="newsletter";heading="Join Our World of Silk";body="Receive exclusive access to new collections, design inspiration, and stories celebrating the artistry of fine silk.";emailPlaceholder="Enter your email ID";submitLabel="Subscribe Now";image=(ImageRef "newsletter" "Traditional silk weaving loom")}
  )
}
$payload = @{mutations=@(@{createOrReplace=$settings},@{createOrReplace=$homeDoc})} | ConvertTo-Json -Depth 40 -Compress
$mutationUrl = "https://$project.api.sanity.io/v2025-02-19/data/mutate/$dataset"
$result = Invoke-RestMethod -Method Post -Uri $mutationUrl -Headers $headers -ContentType "application/json" -Body ([Text.Encoding]::UTF8.GetBytes($payload))
Write-Output "Seeded $($assets.Count) assets and $($result.results.Count) documents."
