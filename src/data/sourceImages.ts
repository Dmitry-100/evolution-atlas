export type SourceImageRecord = {
  src: string;
  sourceUrl: string;
  credit: string;
  license: string;
  commonsTitle: string;
  description: string;
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
    "src": "/assets/images/source-backed/choanoflagellates.png",
    "sourceUrl": "https://commons.wikimedia.org/wiki/File:PhysRevLett.116.038102-Fig1.png",
    "credit": "Julius B. Kirkegaard, Alan O. Marron, Raymond E. Goldstein / Wikimedia Commons",
    "license": "CC BY 3.0",
    "commonsTitle": "File:PhysRevLett.116.038102-Fig1.png",
    "description": "The choanoflagellate Salpingoeca rosetta . (a) Bright field image (5 μm scale) and (b) schematics of ‘slow-swimmer’ single cell, base angle θ, and rosette colony."
  },
  "ediacaran": {
    "src": "/assets/images/source-backed/ediacaran.jpg",
    "sourceUrl": "https://commons.wikimedia.org/wiki/File:Dickinsonia_fossil_and_restoration.jpg",
    "credit": "Ghedoghedo / Wikimedia Commons",
    "license": "CC BY-SA 4.0",
    "commonsTitle": "File:Dickinsonia fossil and restoration.jpg",
    "description": "Fossil and restoration of Dickinsonia- Took the picture at Museum am Lowentor, Stuttgard"
  },
  "bilaterians": {
    "src": "/assets/images/source-backed/bilaterians.jpg",
    "sourceUrl": "https://commons.wikimedia.org/wiki/File:Kimberella_quadrata_001A.jpg",
    "credit": "Masahiro miyasaka / Wikimedia Commons",
    "license": "CC BY-SA 4.0",
    "commonsTitle": "File:Kimberella quadrata 001A.jpg",
    "description": "Kimberella quadrata Fossil"
  },
  "early-chordates": {
    "src": "/assets/images/source-backed/early-chordates.png",
    "sourceUrl": "https://commons.wikimedia.org/wiki/File:Schematic_anatomical_reconstruction_of_Pikaia_flipped.png",
    "credit": "Giovanni Mussini, M. Paul Smith, Jakob Vinther, Imran A. Rahman, Duncan J.E. Murdock, David A.T. Harper, Frances S. Dunn / Wikimedia Commons",
    "license": "CC BY 4.0",
    "commonsTitle": "File:Schematic anatomical reconstruction of Pikaia flipped.png",
    "description": "Schematic reconstruction of the anterior region of Pikaia under the new anatomical interpretation, showing the anterior appendages as dorsally directed gills."
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
    "src": "/assets/images/source-backed/jawed-fish.jpg",
    "sourceUrl": "https://commons.wikimedia.org/wiki/File:Dunkleosteus_terrelli_(fossil).jpg",
    "credit": "Ghedoghedo / Wikimedia Commons",
    "license": "CC BY-SA 3.0",
    "commonsTitle": "File:Dunkleosteus terrelli (fossil).jpg",
    "description": "Fossil of Dunkleosteus, an extinct fish- Took the photo at Senckenberg Museum of Frankfurt"
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
    "sourceUrl": "https://commons.wikimedia.org/wiki/File:Skeleton_of_Ichthyostega.JPG",
    "credit": "OlegTarabanov / Wikimedia Commons",
    "license": "CC BY-SA 3.0",
    "commonsTitle": "File:Skeleton of Ichthyostega.JPG",
    "description": "Skeleton of Ichthyostega in Moscow Paleontological Museum"
  },
  "amniotes": {
    "src": "/assets/images/source-backed/amniotes.jpg",
    "sourceUrl": "https://commons.wikimedia.org/wiki/File:Hylonomus_lyelli.jpg",
    "credit": "https://www.si.edu/object/hylonomus-lyelli-dawson-1860:nmnhpaleobiology_3441092 / Wikimedia Commons",
    "license": "CC BY-SA 4.0",
    "commonsTitle": "File:Hylonomus lyelli.jpg",
    "description": "Hylonomus lyelli"
  },
  "synapsids": {
    "src": "/assets/images/source-backed/synapsids.jpg",
    "sourceUrl": "https://commons.wikimedia.org/wiki/File:Dimetrodon_incisivum_01.jpg",
    "credit": "H. Zell / Wikimedia Commons",
    "license": "CC BY-SA 3.0",
    "commonsTitle": "File:Dimetrodon incisivum 01.jpg",
    "description": "Dimetrodon incisivum , Sphenacodontidae; Permian, Texas, USA; Staatliches Museum für Naturkunde Karlsruhe, Germany."
  },
  "therapsids": {
    "src": "/assets/images/source-backed/therapsids.jpg",
    "sourceUrl": "https://commons.wikimedia.org/wiki/File:AMNH_2240_Lycaenops_skeleton.jpg",
    "credit": "Skye McDavid / Wikimedia Commons",
    "license": "CC BY-SA 4.0",
    "commonsTitle": "File:AMNH 2240 Lycaenops skeleton.jpg",
    "description": "Mounted skeleton of AMNH 2240, skeleton of Lycaenops ornatus. Collected in 1928 by R Broom at Biesjespoort Station, South Africa, now on display at the American Museum of Natural History in New York."
  },
  "cynodonts": {
    "src": "/assets/images/source-backed/cynodonts.jpg",
    "sourceUrl": "https://commons.wikimedia.org/wiki/File:Iziko_Thrinaxodon_fossil.JPG",
    "credit": "Nkansahrexford / Wikimedia Commons",
    "license": "CC BY 3.0",
    "commonsTitle": "File:Iziko Thrinaxodon fossil.JPG",
    "description": "Thrinaxodon fossil"
  },
  "early-mammals": {
    "src": "/assets/images/source-backed/early-mammals.jpg",
    "sourceUrl": "https://commons.wikimedia.org/wiki/File:Morganucodon.jpg",
    "credit": "FunkMonk / Wikimedia Commons",
    "license": "CC BY-SA 3.0",
    "commonsTitle": "File:Morganucodon.jpg",
    "description": "Life restoration of Morganucodon oehleri based on skeletal diagrams."
  },
  "placentals": {
    "src": "/assets/images/source-backed/placentals.jpg",
    "sourceUrl": "https://commons.wikimedia.org/wiki/File:Eomaia_scansoria_54.JPG",
    "credit": "Ghedoghedo / Wikimedia Commons",
    "license": "CC BY-SA 3.0",
    "commonsTitle": "File:Eomaia scansoria 54.JPG",
    "description": "Fossil of Eomaia, an extinct mammal- Took the photo at Musee d'Histoire Naturelle, Paris"
  },
  "after-kpg": {
    "src": "/assets/images/source-backed/after-kpg.jpg",
    "sourceUrl": "https://commons.wikimedia.org/wiki/File:Purgatorius_PNAS.jpg",
    "credit": "Patrick Lynch/Yale University / Wikimedia Commons",
    "license": "Attribution",
    "commonsTitle": "File:Purgatorius PNAS.jpg",
    "description": "Purgatorius , from the Late Paleocene of North America, believed to be the earliest primate. Fossil ankles show that Purgatorius lived in trees."
  },
  "early-primates": {
    "src": "/assets/images/source-backed/early-primates.jpg",
    "sourceUrl": "https://commons.wikimedia.org/wiki/File:Plesiadapis_UMMNH.jpg",
    "credit": "Jonathan Chen / Wikimedia Commons",
    "license": "CC BY-SA 4.0",
    "commonsTitle": "File:Plesiadapis UMMNH.jpg",
    "description": "Skeleton cast (UMMP 87990) of Plesiadapis cookei on display at the University of Michigan Museum of Natural History."
  },
  "anthropoids": {
    "src": "/assets/images/source-backed/anthropoids.jpg",
    "sourceUrl": "https://commons.wikimedia.org/wiki/File:Aegyptopithecus_skull_(University_of_Zurich)-1.JPG",
    "credit": "Guérin Nicolas ( messages ) / Wikimedia Commons",
    "license": "CC BY-SA 3.0",
    "commonsTitle": "File:Aegyptopithecus skull (University of Zurich)-1.JPG",
    "description": "Muséum d'Anthropologie, campus universitaire d'Irchel, Université de Zurich ( Suisse ) : Aegyptopithecus"
  },
  "new-world-monkeys": {
    "src": "/assets/images/source-backed/new-world-monkeys.jpg",
    "sourceUrl": "https://commons.wikimedia.org/wiki/File:White-headed_Capuchin_(Cebus_capucinus)_(28175852037).jpg",
    "credit": "gailhampshire from Cradley, Malvern, U.K / Wikimedia Commons",
    "license": "CC BY 2.0",
    "commonsTitle": "File:White-headed Capuchin (Cebus capucinus) (28175852037).jpg",
    "description": "Soberania Forest, Canal zone, Panama City"
  },
  "old-world-monkeys": {
    "src": "/assets/images/source-backed/old-world-monkeys.jpg",
    "sourceUrl": "https://commons.wikimedia.org/wiki/File:Macaca_nigra_self-portrait_(rotated_and_cropped).jpg",
    "credit": "Self-portrait by the depicted Macaca nigra female; rotated and cropped by David Slater. See article . / Wikimedia Commons",
    "license": "Public domain",
    "commonsTitle": "File:Macaca nigra self-portrait (rotated and cropped).jpg",
    "description": "Portrait of a female Macaca nigra (Celebes crested macaque) in North Sulawesi, Indonesia , who triggered photographer David Slater's camera ."
  },
  "early-apes": {
    "src": "/assets/images/source-backed/early-apes.jpg",
    "sourceUrl": "https://commons.wikimedia.org/wiki/File:Fragmented_skull_with_mandible_of_Proconsul_africanus_(cast)-_Chieti_Museum_of_Biomedical_Sciences.jpg",
    "credit": "Cats' photos / Wikimedia Commons",
    "license": "CC0",
    "commonsTitle": "File:Fragmented skull with mandible of Proconsul africanus (cast)- Chieti Museum of Biomedical Sciences.jpg",
    "description": "Fragmented skull with mandible (cast) in the Chieti Museum of Biomedical Sciences"
  },
  "great-apes": {
    "src": "/assets/images/source-backed/great-apes.jpg",
    "sourceUrl": "https://commons.wikimedia.org/wiki/File:Jos_Schippers_-_Portrait_of_a_chimpanzee.jpg",
    "credit": "Jos Schippers / Wikimedia Commons",
    "license": "Public domain",
    "commonsTitle": "File:Jos Schippers - Portrait of a chimpanzee.jpg",
    "description": "Jos Schippers - Portrait of a chimpanzee.jpg"
  },
  "early-hominins": {
    "src": "/assets/images/source-backed/early-hominins.jpg",
    "sourceUrl": "https://commons.wikimedia.org/wiki/File:Sahelanthropus_tchadensis_-_TM_266-01-060-1.jpg",
    "credit": "Didier Descouens / Wikimedia Commons",
    "license": "CC BY-SA 4.0",
    "commonsTitle": "File:Sahelanthropus tchadensis - TM 266-01-060-1.jpg",
    "description": "Cast of the Sahelanthropus tchadensis holotype cranium TM 266-01-060-1, dubbed Toumaï , in facio-lateral view. Specimen of the previous Molecular Anthropology and Imaging Synthesis Laboratory of the University of Toulouse 3 (with the French National Centre for Scientific Research ( CNRS ) and the University of Strasbourg ) now the Centre for Anthropobiology and Genomics of Toulouse . Size: 182,5 X 105 X 97 mm"
  },
  "ardipithecus": {
    "src": "/assets/images/source-backed/ardipithecus.jpg",
    "sourceUrl": "https://commons.wikimedia.org/wiki/File:Ardipithecus_Ramidus-MGL_96730-P5030040-black.jpg",
    "credit": "Rama / Wikimedia Commons",
    "license": "CC BY-SA 3.0 fr",
    "commonsTitle": "File:Ardipithecus Ramidus-MGL 96730-P5030040-black.jpg",
    "description": "Ardipithecus Ramidus-MGL 96730-P5030040-black.jpg"
  },
  "australopithecus": {
    "src": "/assets/images/source-backed/australopithecus.jpg",
    "sourceUrl": "https://commons.wikimedia.org/wiki/File:Cast_of_the_skeleton_of_Lucy_at_MHNG-IMG_1481-white.jpg",
    "credit": "Rama / Wikimedia Commons",
    "license": "CC BY-SA 3.0 fr",
    "commonsTitle": "File:Cast of the skeleton of Lucy at MHNG-IMG 1481-white.jpg",
    "description": "Cast of the skeleton of Lucy at MHNG-IMG 1481-white.jpg"
  },
  "early-homo": {
    "src": "/assets/images/source-backed/early-homo.jpg",
    "sourceUrl": "https://commons.wikimedia.org/wiki/File:Homo_habilis-MGL_95213-P4150645-black.jpg",
    "credit": "Rama / Wikimedia Commons",
    "license": "CC BY-SA 3.0 fr",
    "commonsTitle": "File:Homo habilis-MGL 95213-P4150645-black.jpg",
    "description": "Homo habilis-MGL 95213-P4150645-black.jpg"
  },
  "homo-erectus": {
    "src": "/assets/images/source-backed/homo-erectus.png",
    "sourceUrl": "https://commons.wikimedia.org/wiki/File:Homo_erectus_skull_cross-section.png",
    "credit": "Franz Weidenreich / Wikimedia Commons",
    "license": "Public domain",
    "commonsTitle": "File:Homo erectus skull cross-section.png",
    "description": "Horizontal cross-section through the ophryon–inion plane of Sinanthropus Skulls III (A) and XII (B), and Pithecanthropus Skull II (C)"
  },
  "heidelbergensis": {
    "src": "/assets/images/source-backed/heidelbergensis.jpg",
    "sourceUrl": "https://commons.wikimedia.org/wiki/File:Homo_heidelbergensis_(43665477172).jpg",
    "credit": "Thomas Quine / Wikimedia Commons",
    "license": "CC BY 2.0",
    "commonsTitle": "File:Homo heidelbergensis (43665477172).jpg",
    "description": "Redpath Museum, McGill University, Montreal, Québec, Canada, 2017"
  },
  "neanderthals": {
    "src": "/assets/images/source-backed/neanderthals.jpg",
    "sourceUrl": "https://commons.wikimedia.org/wiki/File:Neanderthal_skull_from_Forbes%27_Quarry.jpg",
    "credit": "AquilaGib / Wikimedia Commons",
    "license": "CC BY-SA 3.0",
    "commonsTitle": "File:Neanderthal skull from Forbes' Quarry.jpg",
    "description": "Neanderthal skull from Forbes' Quarry, Gibraltar. Discovered 1848"
  },
  "early-sapiens": {
    "src": "/assets/images/source-backed/early-sapiens.jpg",
    "sourceUrl": "https://commons.wikimedia.org/wiki/File:Jebel_Irhoud-1_NMNH.jpg",
    "credit": "Jonathan Chen / Wikimedia Commons",
    "license": "CC BY-SA 4.0",
    "commonsTitle": "File:Jebel Irhoud-1 NMNH.jpg",
    "description": "Homo sapiens skull cast (Jebel Irhoud-1) on display at the Smithsonian's National Museum of Natural History."
  }
};
