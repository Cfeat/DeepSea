$ErrorActionPreference = 'Stop'
$root = Split-Path -Parent (Split-Path -Parent $MyInvocation.MyCommand.Path)
$dir = Join-Path $root 'public\images\creatures'
New-Item -ItemType Directory -Force -Path $dir | Out-Null

$images = @{
  'atlantic-cod' = 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/3d/Atlantic_cod.jpg/640px-Atlantic_cod.jpg'
  'atlantic-salmon' = 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/39/Salmo_salar.jpg/640px-Salmo_salar.jpg'
  'european-pilchard' = 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5e/Sardina_pilchardus.jpg/640px-Sardina_pilchardus.jpg'
  'bottlenose-dolphin' = 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/10/Bottlenose_Dolphin_KSC04pd0178.jpg/640px-Bottlenose_Dolphin_KSC04pd0178.jpg'
  'whale-shark' = 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/7b/Whale_shark_Georgia_aquarium.jpg/640px-Whale_shark_Georgia_aquarium.jpg'
  'mahi-mahi' = 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/8f/Coryphaena_hippurus.jpg/640px-Coryphaena_hippurus.jpg'
  'green-sea-turtle' = 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/32/Green_turtle_in_water.jpg/640px-Green_turtle_in_water.jpg'
  'great-white-shark' = 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/56/White_shark.jpg/640px-White_shark.jpg'
  'blue-whale' = 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/1d/Anim1754_-_Flickr_-_NOAA_Photo_Library.jpg/640px-Anim1754_-_Flickr_-_NOAA_Photo_Library.jpg'
  'humpback-whale' = 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/61/Humpback_Whale_underwater_shot.jpg/640px-Humpback_Whale_underwater_shot.jpg'
  'orca' = 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/37/Killerwhales_jumping.jpg/640px-Killerwhales_jumping.jpg'
  'manta-ray' = 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/9a/Manta_birostris-Thailand-2015.jpg/640px-Manta_birostris-Thailand-2015.jpg'
  'octopus' = 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/57/Octopus2.jpg/640px-Octopus2.jpg'
  'leatherback-turtle' = 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/2b/Leatherback_Turtle.jpg/640px-Leatherback_Turtle.jpg'
  'emperor-penguin' = 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/07/Emperor_Penguin_Manchot_emperor.jpg/640px-Emperor_Penguin_Manchot_emperor.jpg'
  'megamouth-shark' = 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4f/Megamouth_shark.jpg/640px-Megamouth_shark.jpg'
  'lanternfish' = 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e8/Myctophum_sp.jpg/640px-Myctophum_sp.jpg'
  'hatchetfish' = 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/8c/Sternoptyx_diaphana.jpg/640px-Sternoptyx_diaphana.jpg'
  'sperm-whale' = 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b1/Mother_and_baby_sperm_whale.jpg/640px-Mother_and_baby_sperm_whale.jpg'
  'blue-shark' = 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/93/Prionace_glauca.jpg/640px-Prionace_glauca.jpg'
  'barreleye' = 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/7a/Barreleye2.jpg/640px-Barreleye2.jpg'
  'giant-squid' = 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/42/Giant_squid_%28Architeuthis_dux%29.jpg/640px-Giant_squid_%28Architeuthis_dux%29.jpg'
  'japanese-spider-crab' = 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/8a/Macrocheira_kaempferi%2C_Giant_Japanese_spider_crab%2C_Toba_Aquarium%2C_Japan.jpg/640px-Macrocheira_kaempferi%2C_Giant_Japanese_spider_crab%2C_Toba_Aquarium%2C_Japan.jpg'
  'coelacanth' = 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/9b/Latimeria_chalumnae01.jpg/640px-Latimeria_chalumnae01.jpg'
  'vampire-squid' = 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4a/Vampyroteuthis_infernalis.jpg/640px-Vampyroteuthis_infernalis.jpg'
  'narwhal' = 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/9c/Unicorn_of_the_Arctic_%28Narwhals%29.jpg/640px-Unicorn_of_the_Arctic_%28Narwhals%29.jpg'
  'giant-isopod' = 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/48/Bathynomus_giganteus.jpg/640px-Bathynomus_giganteus.jpg'
  'sixgill-shark' = 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a0/Hexanchus_griseus.jpg/640px-Hexanchus_griseus.jpg'
  'frilled-shark' = 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/1d/Frilled_shark_%28Chlamydoselachus_angulineus%29.jpg/640px-Frilled_shark_%28Chlamydoselachus_angulineus%29.jpg'
  'oarfish' = 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b2/Giant_oarfish.jpg/640px-Giant_oarfish.jpg'
  'colossal-squid' = 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/3a/Colossal_squid%2C_Mesonychoteuthis_hamiltoni.jpg/640px-Colossal_squid%2C_Mesonychoteuthis_hamiltoni.jpg'
  'gulper-eel' = 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/9e/Eurypharynx_pelecanoides.jpg/640px-Eurypharynx_pelecanoides.jpg'
  'anglerfish' = 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/2e/Humpback_anglerfish.png/640px-Humpback_anglerfish.png'
  'giant-tube-worm' = 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4e/Riftia_pachyptila_%28deep-sea_vent_worm%29.jpg/640px-Riftia_pachyptila_%28deep-sea_vent_worm%29.jpg'
  'dumbo-octopus' = 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/8f/Dumbo-hires_%28cropped%29.jpg/640px-Dumbo-hires_%28cropped%29.jpg'
  'cuvier-beaked-whale' = 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/f6/Ziphius_cavirostris.jpg/640px-Ziphius_cavirostris.jpg'
  'goblin-shark' = 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/bc/Goblin_shark.jpg/640px-Goblin_shark.jpg'
  'sea-pig' = 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/2e/Scotoplanes_globosa.jpg/640px-Scotoplanes_globosa.jpg'
  'fangtooth' = 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/7c/Anoplogaster_cornuta.jpg/640px-Anoplogaster_cornuta.jpg'
  'dragonfish' = 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d9/Deep_sea_dragonfish_%28Grammatostomias_flagellibarba%29.jpg/640px-Deep_sea_dragonfish_%28Grammatostomias_flagellibarba%29.jpg'
  'tripod-fish' = 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/1a/Bathypterois_grallator.jpg/640px-Bathypterois_grallator.jpg'
  'snailfish' = 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/6f/Pseudoliparis_swirei_%28snailfish%29.jpg/640px-Pseudoliparis_swirei_%28snailfish%29.jpg'
  'amphipod' = 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a2/Hirondellea_gigas.jpg/640px-Hirondellea_gigas.jpg'
  'hadal-jellyfish' = 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5c/Atolla_wyvillei.jpg/640px-Atolla_wyvillei.jpg'
}

foreach ($entry in $images.GetEnumerator()) {
  $out = Join-Path $dir "$($entry.Key).jpg"
  Write-Host "fetch $($entry.Key)..."
  try {
    Invoke-WebRequest -Uri $entry.Value -OutFile $out -UseBasicParsing
  } catch {
    Write-Warning "failed $($entry.Key): $_"
  }
}

Write-Host "Done."
