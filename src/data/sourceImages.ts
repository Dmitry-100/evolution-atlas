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

const generatedAtlasImage = (
  fileName: string,
  description: string,
): SourceImageRecord => {
  const slot = fileName.replace(/\.(jpe?g|png)$/i, "");

  return {
    src: `/assets/images/source-backed/generated-atlas/${fileName}`,
    sourceUrl: "https://openai.com/",
    credit: "AI-реконструкция / локальный визуальный слот",
    license: "AI-реконструкция; визуальная иллюстрация",
    commonsTitle: `generated-atlas-${slot}`,
    description,
    kind: "generated-reconstruction",
    promptId: `generated-atlas-${slot}-2026-06-19`,
  };
};

export const SOURCE_IMAGES: Record<string, SourceImageRecord> = {
  "protocells": generatedAtlasImage(
    "cell-lines.png",
    "AI-визуализация ранней Земли, где энергия, вода, минералы и простые органические молекулы создают предпосылки клеточных линий.",
  ),
  "prokaryotes": generatedAtlasImage("prokaryotes.jpg", "AI-реконструкция ранней прокариотической жизни и микробной среды."),
  "cyanobacteria": generatedAtlasImage("cyanobacteria.jpg", "AI-реконструкция цианобактериальных матов и древних кислородных экосистем."),
  "eukaryotes": generatedAtlasImage("eukaryotes.jpg", "AI-реконструкция ранних эукариотических клеток."),
  "choanoflagellates": generatedAtlasImage("choanoflagellates.jpg", "AI-реконструкция хоанофлагеллят как близких родственников животных."),
  "ediacaran": generatedAtlasImage("early-animals.jpg", "AI-реконструкция ранних животных эдиакарского типа."),
  "bilaterians": generatedAtlasImage("bilaterians.jpg", "AI-реконструкция ранних двусторонне-симметричных животных."),
  "early-chordates": generatedAtlasImage("early-chordates.jpg", "AI-реконструкция ранних хордовых."),
  "early-vertebrates": generatedAtlasImage("early-vertebrates.jpg", "AI-реконструкция ранних позвоночных."),
  "jawed-fish": generatedAtlasImage("jawed-fish.jpg", "AI-реконструкция ранних челюстных рыб."),
  "lobe-finned": generatedAtlasImage("lobe-finned.jpg", "AI-реконструкция лопастеперых рыб."),
  "tiktaalik": generatedAtlasImage("tiktaalik.jpg", "AI-реконструкция перехода позвоночных к суше."),
  "early-tetrapods": generatedAtlasImage("early-tetrapods.jpg", "AI-реконструкция ранних четвероногих."),
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
  "synapsids": generatedAtlasImage("synapsids.jpg", "AI-реконструкция ранних синапсидов на линии млекопитающих."),
  "therapsids": generatedAtlasImage("therapsids.jpg", "AI-реконструкция терапсидов как более близкой к млекопитающим ветви."),
  "cynodonts": generatedAtlasImage("cynodonts.jpg", "AI-реконструкция цинодонтов на пути к млекопитающим."),
  "early-mammals": generatedAtlasImage("early-mammals.jpg", "AI-реконструкция ранних млекопитающих."),
  "placentals": {
    "src": "/assets/images/source-backed/placentals.jpg",
    "sourceUrl": "https://commons.wikimedia.org/wiki/File:Eomaia_scansoria_54.JPG",
    "credit": "Ghedoghedo / Wikimedia Commons",
    "license": "CC BY-SA 3.0",
    "commonsTitle": "File:Eomaia scansoria 54.JPG",
    "description": "Fossil of Eomaia, an extinct mammal- Took the photo at Musee d'Histoire Naturelle, Paris"
  },
  "eomaia-nt": generatedAtlasImage("early-eutherians.jpg", "AI-реконструкция ранних эутериевых млекопитающих."),
  "after-kpg": generatedAtlasImage("after-kpg.jpg", "AI-реконструкция мира после мел-палеогенового вымирания."),
  "purgatorius-bw": generatedAtlasImage("early-primates.jpg", "AI-реконструкция ранних родственников приматов."),
  "early-primates": generatedAtlasImage("ancient-primates.jpg", "AI-реконструкция древних древесных приматов."),
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
  "new-world-monkeys": generatedAtlasImage("new-world-monkeys.jpg", "AI-реконструкция широконосых обезьян."),
  "old-world-monkeys": generatedAtlasImage("old-world-monkeys.jpg", "AI-реконструкция мартышковых обезьян."),
  "catarrhine-figure": {
    "src": "/assets/images/source-backed/oligocene-primate-figure.jpg",
    "sourceUrl": "https://commons.wikimedia.org/wiki/File:Oligocene_primates.jpg",
    "credit": "Wikimedia Commons",
    "license": "см. исходный источник",
    "commonsTitle": "File:Oligocene primates.jpg, cropped primate figure",
    "description": "Cropped early catarrhine-like primate figure from an Oligocene primates panel."
  },
  "aegyptopithecus-nt": generatedAtlasImage("catarrhini.jpg", "AI-реконструкция узконосых обезьян."),
  "early-apes": {
    "src": "/assets/images/source-backed/proconsul-figure.jpg",
    "sourceUrl": "https://commons.wikimedia.org/wiki/File:Ape_evolution.jpg",
    "credit": "Wikimedia Commons",
    "license": "см. исходный источник",
    "commonsTitle": "File:Ape evolution.jpg, cropped Proconsul figure",
    "description": "Cropped Proconsul reconstruction from an ape evolution panel."
  },
  "proconsul-nt": generatedAtlasImage("early-apes.jpg", "AI-реконструкция ранних человекообразных обезьян."),
  "great-apes": generatedAtlasImage("great-apes.jpg", "AI-реконструкция больших человекообразных обезьян."),
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
