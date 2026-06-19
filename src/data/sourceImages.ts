export type SourceImageRecord = {
  src: string;
  sourceUrl: string;
  credit: string;
  license: string;
  commonsTitle: string;
  description: string;
  kind?: "source-backed" | "generated-reconstruction" | "local-plate";
  promptId?: string;
};

export const SOURCE_IMAGES: Record<string, SourceImageRecord> = {
  "protocells": {
    "src": "/assets/images/source-backed/protocells.jpg",
    "sourceUrl": "https://commons.wikimedia.org/wiki/File:Hydrothermal_vent,_Mid-Cayman_Rise_(Expl6955_9664075828).jpg",
    "credit": "NOAA Photo Library / Wikimedia Commons",
    "license": "CC BY 2.0",
    "commonsTitle": "File:Hydrothermal vent, Mid-Cayman Rise (Expl6955 9664075828).jpg",
    "description": "Huge 3-foot orifice of hydrothermal vent at the Von Damm vent site. By comparison, by one measure the Old Faithful orifice is 3-feet across. Image ID: expl6955, Voyage To Inner Space - Exploring the Seas With NOAA Collect Location: Caribbean Sea, Mid-Cayman Rise Photo Date: 2011 August 7 Credit: NOAA Okeanos Explorer Program, Mid-Cayman Rise Expedition 2011"
  },
  "prokaryotes": {
    "src": "/assets/images/source-backed/prokaryotes.jpg",
    "sourceUrl": "https://commons.wikimedia.org/wiki/File:Micrograph_of_a_clue_cell.jpg",
    "credit": "Mikael Häggström , M.D. Author info - Reusing images - Conflicts of interest: None Mikael Häggström , M.D. Consent note : Consent from the patient or patient's relatives is regarded as redundant, because of absence of identifiable features ( List of HIPAA identifiers ) in the media and case information ( See also HIPAA case reports guidance ). / Wikimedia Commons",
    "license": "CC0",
    "commonsTitle": "File:Micrograph of a clue cell.jpg",
    "description": "Micrograph of a clue cell (center), covered in bacteria, as compared to an unremarkable squamous cell at bottom left, and a neutrophil at bottom center. Pap stain"
  },
  "cyanobacteria": {
    "src": "/assets/images/source-backed/cyanobacteria.jpg",
    "sourceUrl": "https://commons.wikimedia.org/wiki/File:Stromatolites,_Belt_Supergroup,_Glacier_National_Park.jpg",
    "credit": "James St. John / Wikimedia Commons",
    "license": "CC BY 2.0",
    "commonsTitle": "File:Stromatolites, Belt Supergroup, Glacier National Park.jpg",
    "description": "Stromatolites (cut & polished slice) from the Precambrian of Montana (public display, Museum of the Rockies, Bozeman, Montana, USA). Stratigraphy: Snowslip Formation, Belt Supergroup, Mesoproterozoic, ~1.44 Ga. Locality: Glacier National Park, northwestern Montana, USA. Stromatolites are large, layered structures built up by mats of cyanobacteria. Stromatolites vary in appearance, ranging from slightly wrinkled horizontal laminations in sedimentary rocks to low mounds to prominent mounds to columnar structures and other forms. Stromatolites are most common in the Proterozoic fossil record. They are scarce today, but famous modern examples occur at Shark Bay, Western Australia."
  },
  "eukaryotes": {
    "src": "/assets/images/source-backed/eukaryotes.jpg",
    "sourceUrl": "https://commons.wikimedia.org/wiki/File:Paramecium_undergoing_Cyst_Formation.jpg",
    "credit": "Sayanur Rahaman / Wikimedia Commons",
    "license": "CC BY-SA 4.0",
    "commonsTitle": "File:Paramecium undergoing Cyst Formation.jpg",
    "description": "Here we see a Paramecium (stained with safranin) undergoing cyst formation in an extremely dehydrating environment as onlooking gram +ve bacteria look on"
  },
  "choanoflagellates": {
    "src": "/assets/images/source-backed/choanoflagellates-museum.jpg",
    "sourceUrl": "https://commons.wikimedia.org/wiki/File:PhysRevLett.116.038102-Fig1.png",
    "credit": "Julius B. Kirkegaard, Alan O. Marron, Raymond E. Goldstein / Wikimedia Commons / локальная музейная обработка",
    "license": "CC BY 3.0",
    "commonsTitle": "File:PhysRevLett.116.038102-Fig1.png",
    "description": "The choanoflagellate Salpingoeca rosetta, placed on a local museum-style background."
  },
  "ediacaran": {
    "src": "/assets/images/source-backed/ediacaran-diorama-nmnh.jpg",
    "sourceUrl": "https://commons.wikimedia.org/wiki/File:Ediacaran_ecosystem_diorama_NMNH.jpg",
    "credit": "Smithsonian National Museum of Natural History / Wikimedia Commons",
    "license": "см. исходный источник",
    "commonsTitle": "File:Ediacaran ecosystem diorama NMNH.jpg",
    "description": "Museum diorama of an Ediacaran ecosystem."
  },
  "bilaterians": {
    "src": "/assets/images/source-backed/kimberella-life.jpg",
    "sourceUrl": "https://commons.wikimedia.org/wiki/File:Kimberella.jpg",
    "credit": "Wikimedia Commons",
    "license": "см. исходный источник",
    "commonsTitle": "File:Kimberella.jpg",
    "description": "Life reconstruction of Kimberella, an early bilaterian-like animal."
  },
  "early-chordates": {
    "src": "/assets/images/source-backed/generated-early-chordates.png",
    "sourceUrl": "https://openai.com/",
    "credit": "AI-реконструкция / локальный визуальный слот",
    "license": "AI-реконструкция; визуальная иллюстрация",
    "kind": "generated-reconstruction",
    "promptId": "timeline-river-evolution-crop-early-chordates-2026-06-19",
    "commonsTitle": "generated-early-chordates",
    "description": "Generated museum-style scene for early chordates, designed as a replaceable visual slot."
  },
  "early-vertebrates": {
    "src": "/assets/images/source-backed/early-vertebrates.png",
    "sourceUrl": "https://commons.wikimedia.org/wiki/File:Haikouichthys_3d.png",
    "credit": "Talifero / Wikimedia Commons",
    "license": "CC BY-SA 3.0",
    "commonsTitle": "File:Haikouichthys 3d.png",
    "description": "Reconstruction of Haikouichthys ercaicunensis. Based on actual fossil evidence."
  },
  "jawed-fish": {
    "src": "/assets/images/source-backed/dunkleosteus-life.png",
    "sourceUrl": "https://commons.wikimedia.org/wiki/File:Dunkleosteus_marsaisi_life_reconstruction.png",
    "credit": "Wikimedia Commons",
    "license": "см. исходный источник",
    "commonsTitle": "File:Dunkleosteus marsaisi life reconstruction.png",
    "description": "Life reconstruction of a Devonian armored jawed fish."
  },
  "lobe-finned": {
    "src": "/assets/images/source-backed/lobe-finned.jpg",
    "sourceUrl": "https://commons.wikimedia.org/wiki/File:Latimeria_Chalumnae_-_Coelacanth_-_NHMW.jpg",
    "credit": "Alberto Fernandez Fernandez / Wikimedia Commons",
    "license": "CC BY-SA 3.0",
    "commonsTitle": "File:Latimeria Chalumnae - Coelacanth - NHMW.jpg",
    "description": "Preserved specimen of chalumnae (Also known as Coelacanth [1] ) in the Natural History Museum, Vienna, Austria. Believed to have been extinct for 70 million years, this specimen was caught the 18 October of 1974, next to Salimani/Selimani (Grande Comore, Comoros Islands) 11°48′40.7″S 43°16′3.3″E / 11.811306°S 43.267583°E / -11.811306; 43.267583 Length: 170 cm - Weight: 60 kg Obtained by stiching 3 HiRes images and removing the background with image post-processing."
  },
  "tiktaalik": {
    "src": "/assets/images/source-backed/tiktaalik.jpg",
    "sourceUrl": "https://commons.wikimedia.org/wiki/File:Tiktaalik_roseae_life_restor.jpg",
    "credit": "Zina Deretsky , National Science Foundation / Wikimedia Commons",
    "license": "Public domain",
    "commonsTitle": "File:Tiktaalik roseae life restor.jpg",
    "description": "Life restoration of Tiktaalik roseae , a transitional fossil (\"missing link\") between sarcopterygian fishes and tetrapods from the late Devonian period of North America. New research has provided the first detailed look at the internal head skeleton of Tiktaalik roseae , the 375-million-year-old fossil animal that represents an important intermediate step in the evolutionary transition from fish to animals that walked on land. This is an artist's conception of the species. The image has frequently been used in Internet meme templates. [1]"
  },
  "early-tetrapods": {
    "src": "/assets/images/source-backed/early-tetrapods.jpg",
    "sourceUrl": "https://commons.wikimedia.org/wiki/File:Ichthyostega_stensioei.png",
    "credit": "Wikimedia Commons / локальная музейная обработка",
    "license": "см. исходный источник",
    "commonsTitle": "File:Ichthyostega stensioei.png",
    "description": "Life reconstruction of Ichthyostega, an early tetrapod, placed on a local museum-style background."
  },
  "amniotes": {
    "src": "/assets/images/source-backed/amniotes.jpg",
    "sourceUrl": "https://commons.wikimedia.org/wiki/File:Hylonomus_lyelli.jpg",
    "credit": "https://www.si.edu/object/hylonomus-lyelli-dawson-1860:nmnhpaleobiology_3441092 / Wikimedia Commons",
    "license": "CC BY-SA 4.0",
    "commonsTitle": "File:Hylonomus lyelli.jpg",
    "description": "Hylonomus lyelli"
  },
  "hylonomus-muse": {
    "src": "/assets/images/source-backed/generated-amniote-common-ancestor.png",
    "sourceUrl": "https://openai.com/",
    "credit": "AI-реконструкция / локальный визуальный слот",
    "license": "AI-реконструкция; визуальная иллюстрация",
    "kind": "generated-reconstruction",
    "promptId": "common-ancestor-with-dinosaurs-2026-06-19",
    "commonsTitle": "generated-amniote-common-ancestor",
    "description": "Generated museum-style reconstruction of an early amniote-like common ancestor."
  },
  "synapsids": {
    "src": "/assets/images/source-backed/dimetrodon-life.jpg",
    "sourceUrl": "https://commons.wikimedia.org/wiki/File:Dimetrodon_teutonis_life_restoration_by_Sebastian_Brandt_(Reco-Brandt).jpg",
    "credit": "Sebastian Brandt / Wikimedia Commons",
    "license": "см. исходный источник",
    "commonsTitle": "File:Dimetrodon teutonis life restoration by Sebastian Brandt (Reco-Brandt).jpg",
    "description": "Life restoration of Dimetrodon, an early synapsid."
  },
  "therapsids": {
    "src": "/assets/images/source-backed/lycaenops-museum.jpg",
    "sourceUrl": "https://commons.wikimedia.org/wiki/File:Lycaenops_life_restoration.jpg",
    "credit": "Wikimedia Commons / локальная музейная обработка",
    "license": "см. исходный источник",
    "commonsTitle": "File:Lycaenops life restoration.jpg",
    "description": "Life restoration of Lycaenops, a predatory therapsid, placed on a local museum-style background."
  },
  "cynodonts": {
    "src": "/assets/images/source-backed/thrinaxodon-museum.jpg",
    "sourceUrl": "https://commons.wikimedia.org/wiki/File:Thrinaxodon_BW.jpg",
    "credit": "Nobu Tamura / Wikimedia Commons / локальная музейная обработка",
    "license": "см. исходный источник",
    "commonsTitle": "File:Thrinaxodon BW.jpg",
    "description": "Life restoration of Thrinaxodon, a cynodont close to the mammal line, placed on a local museum-style background."
  },
  "early-mammals": {
    "src": "/assets/images/source-backed/morganucodon-museum.jpg",
    "sourceUrl": "https://commons.wikimedia.org/wiki/File:Morganucodon.jpg",
    "credit": "FunkMonk / Wikimedia Commons / локальная музейная обработка",
    "license": "CC BY-SA 3.0",
    "commonsTitle": "File:Morganucodon.jpg",
    "description": "Life restoration of Morganucodon oehleri based on skeletal diagrams, placed on a local museum-style background."
  },
  "placentals": {
    "src": "/assets/images/source-backed/placentals.jpg",
    "sourceUrl": "https://commons.wikimedia.org/wiki/File:Eomaia_scansoria_54.JPG",
    "credit": "Ghedoghedo / Wikimedia Commons",
    "license": "CC BY-SA 3.0",
    "commonsTitle": "File:Eomaia scansoria 54.JPG",
    "description": "Fossil of Eomaia, an extinct mammal- Took the photo at Musee d'Histoire Naturelle, Paris"
  },
  "eomaia-nt": {
    "src": "/assets/images/source-backed/eomaia-museum.jpg",
    "sourceUrl": "https://commons.wikimedia.org/wiki/File:Eomaia_NT.jpg",
    "credit": "Nobu Tamura / Wikimedia Commons / локальная музейная обработка",
    "license": "см. исходный источник",
    "commonsTitle": "File:Eomaia NT.jpg",
    "description": "Life restoration of Eomaia, an early eutherian mammal, placed on a local museum-style background."
  },
  "after-kpg": {
    "src": "/assets/images/source-backed/after-kpg.jpg",
    "sourceUrl": "https://commons.wikimedia.org/wiki/File:Purgatorius_PNAS.jpg",
    "credit": "Patrick Lynch/Yale University / Wikimedia Commons",
    "license": "Attribution",
    "commonsTitle": "File:Purgatorius PNAS.jpg",
    "description": "Purgatorius, from the latest Cretaceous and Paleocene of North America, treated here as an early primate relative close to the base of the primate line."
  },
  "purgatorius-bw": {
    "src": "/assets/images/source-backed/purgatorius-museum.jpg",
    "sourceUrl": "https://commons.wikimedia.org/wiki/File:Purgatorius_BW.jpg",
    "credit": "Nobu Tamura / Wikimedia Commons / локальная музейная обработка",
    "license": "см. исходный источник",
    "commonsTitle": "File:Purgatorius BW.jpg",
    "description": "Life restoration of Purgatorius, an early primate relative, placed on a local museum-style background."
  },
  "early-primates": {
    "src": "/assets/images/source-backed/plesiadapis-museum.jpg",
    "sourceUrl": "https://commons.wikimedia.org/wiki/File:Plesiadapis_NT.jpg",
    "credit": "Nobu Tamura / Wikimedia Commons / локальная музейная обработка",
    "license": "см. исходный источник",
    "commonsTitle": "File:Plesiadapis NT.jpg",
    "description": "Life restoration of Plesiadapis, placed on a local museum-style background."
  },
  "anthropoids": {
    "src": "/assets/images/source-backed/generated-anthropoid-primate.jpg",
    "sourceUrl": "https://openai.com/",
    "credit": "OpenAI image generation / локальная реконструкция",
    "license": "AI-реконструкция; не исходное научное изображение",
    "commonsTitle": "generated-anthropoid-primate",
    "description": "Generated museum paleoart reconstruction of an early Oligocene anthropoid primate.",
    "kind": "generated-reconstruction",
    "promptId": "early-oligocene-anthropoid-paleoart-2026-06-17"
  },
  "new-world-monkeys": {
    "src": "/assets/images/source-backed/capuchin-branch.jpg",
    "sourceUrl": "https://commons.wikimedia.org/wiki/File:White-faced_Capuchin_Monkey_(49549848091).jpg",
    "credit": "Wikimedia Commons",
    "license": "см. исходный источник",
    "commonsTitle": "File:White-faced Capuchin Monkey (49549848091).jpg",
    "description": "Portrait of a white-faced capuchin monkey, used as a clear modern example of a New World monkey branch."
  },
  "old-world-monkeys": {
    "src": "/assets/images/source-backed/douc-langur-head.jpg",
    "sourceUrl": "https://commons.wikimedia.org/wiki/File:Pygathrix_Nemaeus_head.JPG",
    "credit": "Wikimedia Commons",
    "license": "см. исходный источник",
    "commonsTitle": "File:Pygathrix Nemaeus head.JPG",
    "description": "Portrait of a douc langur, used as a clear modern example of an Old World monkey branch."
  },
  "catarrhine-figure": {
    "src": "/assets/images/source-backed/oligocene-primate-figure.jpg",
    "sourceUrl": "https://commons.wikimedia.org/wiki/File:Oligocene_primates.jpg",
    "credit": "Wikimedia Commons",
    "license": "см. исходный источник",
    "commonsTitle": "File:Oligocene primates.jpg, cropped primate figure",
    "description": "Cropped early catarrhine-like primate figure from an Oligocene primates panel."
  },
  "aegyptopithecus-nt": {
    "src": "/assets/images/source-backed/aegyptopithecus-museum.jpg",
    "sourceUrl": "https://commons.wikimedia.org/wiki/File:Aegyptopithecus_NT.jpg",
    "credit": "Nobu Tamura / Wikimedia Commons / локальная музейная обработка",
    "license": "см. исходный источник",
    "commonsTitle": "File:Aegyptopithecus NT.jpg",
    "description": "Life restoration of Aegyptopithecus, an Oligocene anthropoid primate, placed on a local museum-style background."
  },
  "early-apes": {
    "src": "/assets/images/source-backed/proconsul-figure.jpg",
    "sourceUrl": "https://commons.wikimedia.org/wiki/File:Ape_evolution.jpg",
    "credit": "Wikimedia Commons",
    "license": "см. исходный источник",
    "commonsTitle": "File:Ape evolution.jpg, cropped Proconsul figure",
    "description": "Cropped Proconsul reconstruction from an ape evolution panel."
  },
  "proconsul-nt": {
    "src": "/assets/images/source-backed/proconsul-museum.jpg",
    "sourceUrl": "https://commons.wikimedia.org/wiki/File:Proconsul_NT.jpg",
    "credit": "Nobu Tamura / Wikimedia Commons / локальная музейная обработка",
    "license": "см. исходный источник",
    "commonsTitle": "File:Proconsul NT.jpg",
    "description": "Life restoration of Proconsul, an early ape, placed on a local museum-style background."
  },
  "great-apes": {
    "src": "/assets/images/source-backed/chimpanzees-branch.jpg",
    "sourceUrl": "https://commons.wikimedia.org/wiki/File:2006-12-09_Chipanzees_D_Bruyere.JPG",
    "credit": "D. Bruyere / Wikimedia Commons",
    "license": "см. исходный источник",
    "commonsTitle": "File:2006-12-09 Chipanzees D Bruyere.JPG",
    "description": "Chimpanzees used as a clear modern example of the great ape family branch."
  },
  "early-hominins": {
    "src": "/assets/images/source-backed/early-hominins.jpg",
    "sourceUrl": "https://commons.wikimedia.org/wiki/File:Sahelanthropus_tchadensis_-_TM_266-01-060-1.jpg",
    "credit": "Didier Descouens / Wikimedia Commons",
    "license": "CC BY-SA 4.0",
    "commonsTitle": "File:Sahelanthropus tchadensis - TM 266-01-060-1.jpg",
    "description": "Cast of the Sahelanthropus tchadensis holotype cranium TM 266-01-060-1, dubbed Toumaï , in facio-lateral view. Specimen of the previous Molecular Anthropology and Imaging Synthesis Laboratory of the University of Toulouse 3 (with the French National Centre for Scientific Research ( CNRS ) and the University of Strasbourg ) now the Centre for Anthropobiology and Genomics of Toulouse . Size: 182,5 X 105 X 97 mm"
  },
  "generated-early-hominin": {
    "src": "/assets/images/source-backed/generated-early-hominin.png",
    "sourceUrl": "https://openai.com/",
    "credit": "OpenAI image generation / локальная реконструкция",
    "license": "AI-реконструкция; не исходное научное изображение",
    "commonsTitle": "generated-early-hominin",
    "description": "Generated museum paleoart reconstruction of an early hominin around the human-chimpanzee split.",
    "kind": "generated-reconstruction",
    "promptId": "early-hominin-miocene-paleoart-2026-06-17"
  },
  "ardipithecus": {
    "src": "/assets/images/source-backed/ardipithecus.jpg",
    "sourceUrl": "https://commons.wikimedia.org/wiki/File:Ardipithecus_Ramidus-MGL_96730-P5030040-black.jpg",
    "credit": "Rama / Wikimedia Commons",
    "license": "CC BY-SA 3.0 fr",
    "commonsTitle": "File:Ardipithecus Ramidus-MGL 96730-P5030040-black.jpg",
    "description": "Ardipithecus Ramidus-MGL 96730-P5030040-black.jpg"
  },
  "generated-ardipithecus": {
    "src": "/assets/images/source-backed/generated-ardipithecus-ramidus.png",
    "sourceUrl": "https://openai.com/",
    "credit": "OpenAI image generation / локальная реконструкция",
    "license": "AI-реконструкция; не исходное научное изображение",
    "commonsTitle": "generated-ardipithecus-ramidus",
    "description": "Generated museum paleoart reconstruction of Ardipithecus ramidus in woodland habitat.",
    "kind": "generated-reconstruction",
    "promptId": "ardipithecus-ramidus-woodland-paleoart-2026-06-17"
  },
  "australopithecus": {
    "src": "/assets/images/source-backed/australopithecus.jpg",
    "sourceUrl": "https://commons.wikimedia.org/wiki/File:Cast_of_the_skeleton_of_Lucy_at_MHNG-IMG_1481-white.jpg",
    "credit": "Rama / Wikimedia Commons",
    "license": "CC BY-SA 3.0 fr",
    "commonsTitle": "File:Cast of the skeleton of Lucy at MHNG-IMG 1481-white.jpg",
    "description": "Cast of the skeleton of Lucy at MHNG-IMG 1481-white.jpg"
  },
  "australopithecus-lucy-face": {
    "src": "/assets/images/source-backed/australopithecus-lucy-face.jpg",
    "sourceUrl": "https://commons.wikimedia.org/wiki/File:Lucy_-_Australopithecus_afarensis_-_forensic_facial_approximation.jpg",
    "credit": "Cicero Moraes et al. / Wikimedia Commons",
    "license": "см. исходный источник",
    "commonsTitle": "File:Lucy - Australopithecus afarensis - forensic facial approximation.jpg",
    "description": "Forensic facial approximation of Australopithecus afarensis."
  },
  "early-homo": {
    "src": "/assets/images/source-backed/homo-habilis-reconstruction.png",
    "sourceUrl": "https://commons.wikimedia.org/wiki/File:Homo_habilis_-_forensic_facial_reconstruction.png",
    "credit": "Wikimedia Commons",
    "license": "см. исходный источник",
    "commonsTitle": "File:Homo habilis - forensic facial reconstruction.png",
    "description": "Forensic facial reconstruction of Homo habilis."
  },
  "homo-erectus": {
    "src": "/assets/images/source-backed/smithsonian-homo-erectus.jpg",
    "sourceUrl": "https://humanorigins.si.edu/multimedia/slideshows/reconstructed-faces",
    "credit": "Smithsonian Human Origins Program / reconstruction by John Gurche",
    "license": "см. исходный источник",
    "commonsTitle": "Smithsonian reconstructed faces: Homo erectus",
    "description": "Museum facial reconstruction of Homo erectus."
  },
  "heidelbergensis": {
    "src": "/assets/images/source-backed/smithsonian-heidelbergensis.jpg",
    "sourceUrl": "https://humanorigins.si.edu/multimedia/slideshows/reconstructed-faces",
    "credit": "Smithsonian Human Origins Program / reconstruction by John Gurche",
    "license": "см. исходный источник",
    "commonsTitle": "Smithsonian reconstructed faces: Homo heidelbergensis",
    "description": "Museum facial reconstruction of Homo heidelbergensis."
  },
  "generated-heidelbergensis": {
    "src": "/assets/images/source-backed/generated-heidelbergensis.png",
    "sourceUrl": "https://openai.com/",
    "credit": "OpenAI image generation / локальная реконструкция",
    "license": "AI-реконструкция; не исходное научное изображение",
    "commonsTitle": "generated-heidelbergensis",
    "description": "Generated museum paleoart reconstruction of Homo heidelbergensis.",
    "kind": "generated-reconstruction",
    "promptId": "homo-heidelbergensis-paleoart-2026-06-17"
  },
  "neanderthals": {
    "src": "/assets/images/source-backed/smithsonian-neanderthal.jpg",
    "sourceUrl": "https://humanorigins.si.edu/multimedia/slideshows/reconstructed-faces",
    "credit": "Smithsonian Human Origins Program / reconstruction by John Gurche",
    "license": "см. исходный источник",
    "commonsTitle": "Smithsonian reconstructed faces: Homo neanderthalensis",
    "description": "Museum facial reconstruction of Homo neanderthalensis."
  },
  "generated-neanderthal": {
    "src": "/assets/images/source-backed/generated-neanderthal.png",
    "sourceUrl": "https://openai.com/",
    "credit": "OpenAI image generation / локальная реконструкция",
    "license": "AI-реконструкция; не исходное научное изображение",
    "commonsTitle": "generated-neanderthal",
    "description": "Generated museum paleoart reconstruction of Homo neanderthalensis.",
    "kind": "generated-reconstruction",
    "promptId": "homo-neanderthalensis-paleoart-2026-06-17"
  },
  "early-sapiens": {
    "src": "/assets/images/source-backed/early-sapiens.jpg",
    "sourceUrl": "https://commons.wikimedia.org/wiki/File:Jebel_Irhoud-1_NMNH.jpg",
    "credit": "Jonathan Chen / Wikimedia Commons",
    "license": "CC BY-SA 4.0",
    "commonsTitle": "File:Jebel Irhoud-1 NMNH.jpg",
    "description": "Homo sapiens skull cast (Jebel Irhoud-1) on display at the Smithsonian's National Museum of Natural History."
  },
  "generated-homo-sapiens": {
    "src": "/assets/images/source-backed/generated-homo-sapiens.jpg",
    "sourceUrl": "https://openai.com/",
    "credit": "OpenAI image generation / локальная реконструкция",
    "license": "AI-реконструкция; не исходное научное изображение",
    "commonsTitle": "generated-homo-sapiens",
    "description": "Generated paleoart portrait of early Homo sapiens in an African landscape.",
    "kind": "generated-reconstruction",
    "promptId": "homo-sapiens-african-landscape-2026-06-18"
  },
  "sapiens-paleolithic-muse": {
    "src": "/assets/images/source-backed/sapiens-museum-dark.jpg",
    "sourceUrl": "https://commons.wikimedia.org/wiki/File:Homo_sapiens_-_Paleolithic_-_reconstruction_-_MUSE.jpg",
    "credit": "MUSE - Museo delle Scienze / Wikimedia Commons / локальная музейная обработка",
    "license": "см. исходный источник",
    "commonsTitle": "File:Homo sapiens - Paleolithic - reconstruction - MUSE.jpg",
    "description": "Paleolithic Homo sapiens reconstruction, placed on a local museum-style background."
  }
};
