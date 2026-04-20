import dotenv from "dotenv";
import mongoose from "mongoose";
import Package from "./models/Package.js";

dotenv.config();


const sriLankaPackages = [
  // ── ADVENTURE ──────────────────────────────────────────────────
  {
    title: "Knuckles Mountain Range Trek",
    description: "Multi-day trek through the UNESCO-listed Knuckles range with cloud forests, waterfalls, and remote village stays.",
    location: "Kandy", categories: ["adventure", "eco"],
    weather: ["cool", "humid"], interests: ["hiking", "nature_photography", "camping"],
    price: 28000, no_of_days: 4, min_group_size: 2, max_group_size: 12
  },
  {
    title: "Bambarakanda Falls Adventure",
    description: "Hike to Sri Lanka's tallest waterfall through pine forests and misty highland terrain.",
    location: "Badulla", categories: ["adventure", "eco"],
    weather: ["cool", "humid"], interests: ["hiking", "nature_photography"],
    price: 15000, no_of_days: 2, min_group_size: 1, max_group_size: 15
  },
  {
    title: "Adam's Peak Pilgrimage Trek",
    description: "Night climb to Sri Pada to witness the sacred footprint and legendary sunrise shadow.",
    location: "Ratnapura", categories: ["adventure", "cultural"],
    weather: ["cool", "rainy"], interests: ["hiking", "nature_photography"],
    price: 12000, no_of_days: 2, min_group_size: 1, max_group_size: 20
  },
  {
    title: "Riverston Peak Expedition",
    description: "Off-road journey and trek to Riverston, the mini-Horton Plains with panoramic views.",
    location: "Kandy", categories: ["adventure", "eco"],
    weather: ["cool", "humid"], interests: ["hiking", "nature_photography", "cycling"],
    price: 18000, no_of_days: 2, min_group_size: 2, max_group_size: 10
  },
  {
    title: "Meemure Village Trek",
    description: "Trek to the most remote village in Sri Lanka through dense jungle and river crossings.",
    location: "Kandy", categories: ["adventure", "eco"],
    weather: ["humid", "rainy"], interests: ["hiking", "camping", "nature_photography"],
    price: 22000, no_of_days: 3, min_group_size: 2, max_group_size: 8
  },
  {
    title: "Kitulgala White Water Rafting",
    description: "Thrilling white water rafting on the Kelani River plus jungle survival and abseiling.",
    location: "Ratnapura", categories: ["adventure"],
    weather: ["humid", "rainy"], interests: ["camping", "rock_climbing"],
    price: 8500, no_of_days: 1, min_group_size: 2, max_group_size: 20
  },
  {
    title: "Kalupahana Rock Climbing",
    description: "Technical rock climbing on granite faces in the central highlands with certified guides.",
    location: "Badulla", categories: ["adventure"],
    weather: ["cool", "humid"], interests: ["rock_climbing", "nature_photography"],
    price: 11000, no_of_days: 2, min_group_size: 2, max_group_size: 8
  },
  {
    title: "Horton Plains Edge Walk",
    description: "Walk the plateau to World's End cliff and Baker's Falls in the cloud forest reserve.",
    location: "Nuwara Eliya", categories: ["adventure", "eco"],
    weather: ["cool", "humid"], interests: ["hiking", "nature_photography", "bird_watching"],
    price: 14000, no_of_days: 2, min_group_size: 1, max_group_size: 20
  },
  {
    title: "Lakegala Rock Summit",
    description: "Challenging hike to the mythical Lakegala peak in the Knuckles range with jungle camping.",
    location: "Kandy", categories: ["adventure"],
    weather: ["cool", "humid"], interests: ["hiking", "rock_climbing", "camping"],
    price: 19000, no_of_days: 3, min_group_size: 2, max_group_size: 8
  },
  {
    title: "Yala Jeep Night Safari",
    description: "Rare nocturnal wildlife safari in Yala with spotlight tracking of leopards and sloth bears.",
    location: "Yala", categories: ["adventure", "wildlife"],
    weather: ["dry", "sunny"], interests: ["wildlife_spotting", "nature_photography"],
    price: 25000, no_of_days: 2, min_group_size: 2, max_group_size: 6
  },

  // ── WILDLIFE ───────────────────────────────────────────────────
  {
    title: "Elephant Transit Home Visit",
    description: "Watch orphaned baby elephants being fed and cared for at the world-famous ETH in Udawalawe.",
    location: "Udawalawe", categories: ["wildlife", "family"],
    weather: ["sunny", "dry"], interests: ["wildlife_spotting", "nature_photography"],
    price: 9500, no_of_days: 1, min_group_size: 1, max_group_size: 30
  },
  {
    title: "Minneriya Elephant Gathering",
    description: "Witness the world's largest elephant gathering at Minneriya tank during the dry season.",
    location: "Polonnaruwa", categories: ["wildlife"],
    weather: ["dry", "sunny"], interests: ["wildlife_spotting", "nature_photography"],
    price: 17000, no_of_days: 2, min_group_size: 2, max_group_size: 12
  },
  {
    title: "Bundala Flamingo Safari",
    description: "Jeep safari through Bundala National Park to spot flamingoes, crocodiles, and rare shorebirds.",
    location: "Hambantota", categories: ["wildlife", "eco"],
    weather: ["dry", "sunny"], interests: ["bird_watching", "wildlife_spotting", "nature_photography"],
    price: 13500, no_of_days: 2, min_group_size: 2, max_group_size: 8
  },
  {
    title: "Sinharaja Rainforest Birding",
    description: "Expert-guided birding tour in the Sinharaja UNESCO rainforest to spot endemic species.",
    location: "Ratnapura", categories: ["wildlife", "eco"],
    weather: ["humid", "rainy"], interests: ["bird_watching", "nature_photography", "hiking"],
    price: 21000, no_of_days: 3, min_group_size: 2, max_group_size: 8
  },
  {
    title: "Kumana Bird Sanctuary Safari",
    description: "Remote safari to Kumana, one of Asia's most important waterbird nesting sites.",
    location: "Ampara", categories: ["wildlife", "eco"],
    weather: ["dry", "sunny"], interests: ["bird_watching", "wildlife_spotting", "nature_photography"],
    price: 24000, no_of_days: 3, min_group_size: 2, max_group_size: 8
  },
  {
    title: "Leopard Tracking Wilpattu",
    description: "Specialist-led leopard tracking expedition in the lake-dotted wilderness of Wilpattu.",
    location: "Wilpattu", categories: ["wildlife"],
    weather: ["dry", "sunny"], interests: ["wildlife_spotting", "nature_photography"],
    price: 32000, no_of_days: 3, min_group_size: 2, max_group_size: 6
  },
  {
    title: "Blue Whale Watching Mirissa",
    description: "Deep sea expedition to observe blue whales and spinner dolphins off the southern coast.",
    location: "Mirissa", categories: ["wildlife", "eco"],
    weather: ["sunny", "tropical"], interests: ["wildlife_spotting", "nature_photography"],
    price: 8000, no_of_days: 1, min_group_size: 1, max_group_size: 25
  },
  {
    title: "Sea Turtle Nesting Watch",
    description: "Evening guided walk on Rekawa beach to witness green and loggerhead turtles nesting.",
    location: "Hambantota", categories: ["wildlife", "eco"],
    weather: ["tropical", "sunny"], interests: ["wildlife_spotting", "nature_photography"],
    price: 6500, no_of_days: 1, min_group_size: 1, max_group_size: 15
  },
  {
    title: "Crocodile Kayak Safari",
    description: "Silent kayak expedition through the Bentota River mangroves to spot monitor lizards and crocodiles.",
    location: "Bentota", categories: ["wildlife", "eco"],
    weather: ["tropical", "sunny"], interests: ["paddling_boats", "wildlife_spotting", "nature_photography"],
    price: 7500, no_of_days: 1, min_group_size: 1, max_group_size: 12
  },
  {
    title: "Loris Night Walk Kitulgala",
    description: "Guided night walk through Kitulgala forest to spot rare slender loris and endemic amphibians.",
    location: "Ratnapura", categories: ["wildlife", "eco"],
    weather: ["humid", "rainy"], interests: ["wildlife_spotting", "nature_photography", "camping"],
    price: 9000, no_of_days: 1, min_group_size: 2, max_group_size: 8
  },

  // ── HISTORICAL ─────────────────────────────────────────────────
  {
    title: "Anuradhapura Sacred City Walk",
    description: "Guided tour of the ancient sacred city with Ruwanwelisaya stupa, Jetavanaramaya, and Sri Maha Bodhi.",
    location: "Anuradhapura", categories: ["historical", "cultural"],
    weather: ["dry", "sunny"], interests: ["cultural_tours", "nature_photography"],
    price: 11000, no_of_days: 2, min_group_size: 1, max_group_size: 25
  },
  {
    title: "Polonnaruwa Royal City Tour",
    description: "Cycle through the medieval royal city ruins of Polonnaruwa including Gal Viharaya rock carvings.",
    location: "Polonnaruwa", categories: ["historical"],
    weather: ["dry", "sunny"], interests: ["cultural_tours", "cycling", "nature_photography"],
    price: 9500, no_of_days: 2, min_group_size: 1, max_group_size: 20
  },
  {
    title: "Sigiriya Rock Fortress Climb",
    description: "Climb the iconic 5th century rock fortress with frescoes, water gardens, and panoramic views.",
    location: "Sigiriya", categories: ["historical", "adventure"],
    weather: ["sunny", "dry"], interests: ["hiking", "cultural_tours", "nature_photography"],
    price: 13000, no_of_days: 2, min_group_size: 1, max_group_size: 25
  },
  {
    title: "Yapahuwa Kingdom Trek",
    description: "Explore the dramatic rock fortress capital of Yapahuwa with its ornate staircase and jungle setting.",
    location: "Anuradhapura", categories: ["historical", "adventure"],
    weather: ["dry", "sunny"], interests: ["hiking", "cultural_tours", "nature_photography"],
    price: 10000, no_of_days: 2, min_group_size: 1, max_group_size: 15
  },
  {
    title: "Ritigala Forest Monastery",
    description: "Trek through the jungle to discover the mysterious ruined forest monastery of Ritigala.",
    location: "Anuradhapura", categories: ["historical", "eco"],
    weather: ["dry", "humid"], interests: ["hiking", "cultural_tours", "nature_photography"],
    price: 8500, no_of_days: 1, min_group_size: 2, max_group_size: 12
  },
  {
    title: "Galle Fort Heritage Walk",
    description: "Guided walk through the Dutch colonial fort with museums, churches, lighthouse, and sunset views.",
    location: "Galle", categories: ["historical", "cultural"],
    weather: ["sunny", "tropical"], interests: ["cultural_tours", "nature_photography"],
    price: 7500, no_of_days: 1, min_group_size: 1, max_group_size: 25
  },
  {
    title: "Dambulla Cave Temple Tour",
    description: "Visit the largest cave temple complex in Asia with 153 Buddha statues and ancient murals.",
    location: "Dambulla", categories: ["historical", "cultural"],
    weather: ["dry", "sunny"], interests: ["cultural_tours", "nature_photography"],
    price: 8000, no_of_days: 1, min_group_size: 1, max_group_size: 30
  },
  {
    title: "Mihintale Pilgrimage Climb",
    description: "Climb the sacred hill where Buddhism was introduced to Sri Lanka with ancient dagobas and caves.",
    location: "Anuradhapura", categories: ["historical", "cultural"],
    weather: ["dry", "sunny"], interests: ["hiking", "cultural_tours"],
    price: 6000, no_of_days: 1, min_group_size: 1, max_group_size: 25
  },
  {
    title: "Panduwasnuwara Ancient City",
    description: "Explore the rarely visited 5th century BC royal city with moat, palace, and gem pits.",
    location: "Colombo", categories: ["historical"],
    weather: ["sunny", "humid"], interests: ["cultural_tours", "nature_photography"],
    price: 7000, no_of_days: 1, min_group_size: 1, max_group_size: 20
  },
  {
    title: "Buduruwagala Rock Carvings",
    description: "Visit the 9th century Mahayana rock carvings in the jungle near Wellawaya.",
    location: "Badulla", categories: ["historical", "eco"],
    weather: ["dry", "sunny"], interests: ["cultural_tours", "nature_photography", "hiking"],
    price: 9000, no_of_days: 2, min_group_size: 1, max_group_size: 15
  },

  // ── CULTURAL ───────────────────────────────────────────────────
  {
    title: "Kandy Perahera Festival Tour",
    description: "Experience the grand Esala Perahera procession with elephants, dancers, and fire performers.",
    location: "Kandy", categories: ["cultural"],
    weather: ["humid", "rainy"], interests: ["cultural_tours", "nature_photography"],
    price: 16000, no_of_days: 2, min_group_size: 1, max_group_size: 30
  },
  {
    title: "Colombo Street Food Trail",
    description: "Evening guided walk through Pettah, Kotahena, and Fort sampling hoppers, kottu, and watalappan.",
    location: "Colombo", categories: ["cultural"],
    weather: ["tropical", "humid"], interests: ["cultural_tours"],
    price: 5500, no_of_days: 1, min_group_size: 1, max_group_size: 15
  },
  {
    title: "Jaffna Culture Immersion",
    description: "Explore Jaffna's Hindu temples, colonial forts, palmyra crafts, and authentic Tamil cuisine.",
    location: "Jaffna", categories: ["cultural", "historical"],
    weather: ["dry", "sunny"], interests: ["cultural_tours", "nature_photography"],
    price: 22000, no_of_days: 3, min_group_size: 2, max_group_size: 15
  },
  {
    title: "Batik & Handloom Workshop",
    description: "Hands-on workshop in traditional batik fabric dyeing and handloom weaving in Kandy.",
    location: "Kandy", categories: ["cultural"],
    weather: ["cool", "humid"], interests: ["cultural_tours"],
    price: 6000, no_of_days: 1, min_group_size: 1, max_group_size: 15
  },
  {
    title: "Mask Dance of Ambalangoda",
    description: "Visit the mask museum, watch kolam dance performances, and carve your own traditional mask.",
    location: "Galle", categories: ["cultural"],
    weather: ["tropical", "sunny"], interests: ["cultural_tours", "nature_photography"],
    price: 7500, no_of_days: 1, min_group_size: 1, max_group_size: 20
  },
  {
    title: "Ayurveda Village Experience",
    description: "Stay with an Ayurveda family, learn herbal medicine, and receive traditional treatments.",
    location: "Kandy", categories: ["cultural", "wellness"],
    weather: ["cool", "humid"], interests: ["cultural_tours"],
    price: 18000, no_of_days: 3, min_group_size: 1, max_group_size: 8
  },
  {
    title: "Pettah Market and Fort Walk",
    description: "Guided tour of Colombo's colonial Fort, Pettah bazaar, and historic churches and mosques.",
    location: "Colombo", categories: ["cultural", "historical"],
    weather: ["tropical", "humid"], interests: ["cultural_tours", "nature_photography"],
    price: 5000, no_of_days: 1, min_group_size: 1, max_group_size: 20
  },
  {
    title: "Tea Estate Life Experience",
    description: "Stay on a working tea estate, pick tea leaves, visit the factory, and meet estate workers.",
    location: "Nuwara Eliya", categories: ["cultural", "eco"],
    weather: ["cool", "humid"], interests: ["cultural_tours", "nature_photography"],
    price: 19500, no_of_days: 3, min_group_size: 1, max_group_size: 12
  },
  {
    title: "Kataragama Festival Pilgrimage",
    description: "Join multi-faith pilgrims at the sacred Kataragama shrine complex for evening puja rituals.",
    location: "Hambantota", categories: ["cultural", "historical"],
    weather: ["dry", "sunny"], interests: ["cultural_tours"],
    price: 8500, no_of_days: 2, min_group_size: 1, max_group_size: 20
  },
  {
    title: "Traditional Cooking Class Galle",
    description: "Learn to cook Sri Lankan curry, string hoppers, and coconut sambol with a local family.",
    location: "Galle", categories: ["cultural"],
    weather: ["tropical", "sunny"], interests: ["cultural_tours"],
    price: 6500, no_of_days: 1, min_group_size: 1, max_group_size: 10
  },

  // ── BEACH ──────────────────────────────────────────────────────
  {
    title: "Mirissa Snorkeling & Beach",
    description: "Snorkel the coral reefs, relax on the crescent beach, and watch the sunset from Parrot Rock.",
    location: "Mirissa", categories: ["beach"],
    weather: ["sunny", "tropical"], interests: ["diving", "nature_photography"],
    price: 9500, no_of_days: 2, min_group_size: 1, max_group_size: 20
  },
  {
    title: "Unawatuna Beach Retreat",
    description: "Lazy days on the horseshoe bay, reef snorkeling, and fresh seafood at beachside restaurants.",
    location: "Galle", categories: ["beach", "wellness"],
    weather: ["sunny", "tropical"], interests: ["diving", "nature_photography"],
    price: 11000, no_of_days: 3, min_group_size: 1, max_group_size: 20
  },
  {
    title: "Arugam Bay Surf Camp",
    description: "Stay at a surf camp and take daily lessons at one of Asia's top right-hand point breaks.",
    location: "Arugam Bay", categories: ["beach", "adventure"],
    weather: ["sunny", "tropical"], interests: ["surfing", "nature_photography"],
    price: 25000, no_of_days: 5, min_group_size: 1, max_group_size: 12
  },
  {
    title: "Nilaveli Scuba Diving",
    description: "Scuba diving excursions to Pigeon Island coral sanctuary with reef sharks and turtles.",
    location: "Trincomalee", categories: ["beach", "wildlife"],
    weather: ["sunny", "tropical"], interests: ["diving", "wildlife_spotting", "nature_photography"],
    price: 18500, no_of_days: 3, min_group_size: 2, max_group_size: 10
  },
  {
    title: "Pasikuda Lagoon Escape",
    description: "Swim in the shallow turquoise lagoon, kayak, and relax on powdery white sand beaches.",
    location: "Batticaloa", categories: ["beach"],
    weather: ["sunny", "tropical"], interests: ["paddling_boats", "diving"],
    price: 14000, no_of_days: 3, min_group_size: 1, max_group_size: 20
  },
  {
    title: "Hikkaduwa Reef Snorkeling",
    description: "Glass-bottom boat rides and snorkeling over the famous Hikkaduwa coral sanctuary.",
    location: "Hikkaduwa", categories: ["beach", "eco"],
    weather: ["sunny", "tropical"], interests: ["diving", "wildlife_spotting"],
    price: 8000, no_of_days: 2, min_group_size: 1, max_group_size: 20
  },
  {
    title: "Kalpitiya Kite Surfing",
    description: "Learn kite surfing on the Kalpitiya lagoon, one of the best kite spots in South Asia.",
    location: "Negombo", categories: ["beach", "adventure"],
    weather: ["sunny", "dry"], interests: ["surfing", "paddling_boats"],
    price: 22000, no_of_days: 3, min_group_size: 1, max_group_size: 8
  },
  {
    title: "Trincomalee Hot Springs & Beach",
    description: "Visit the natural hot springs at Kanniya, then relax on the stunning Trinco beaches.",
    location: "Trincomalee", categories: ["beach", "wellness"],
    weather: ["sunny", "tropical"], interests: ["nature_photography", "cultural_tours"],
    price: 13000, no_of_days: 3, min_group_size: 1, max_group_size: 20
  },
  {
    title: "Weligama Bay Surf Lesson",
    description: "Perfect beginner surf beach with shallow sandy bottom and consistent waves all year.",
    location: "Matara", categories: ["beach", "adventure"],
    weather: ["sunny", "tropical"], interests: ["surfing"],
    price: 7500, no_of_days: 2, min_group_size: 1, max_group_size: 15
  },
  {
    title: "Uppuveli Dolphin Watching",
    description: "Early morning boat trip to watch spinner dolphins and spot sperm whales off Trincomalee.",
    location: "Trincomalee", categories: ["beach", "wildlife"],
    weather: ["sunny", "tropical"], interests: ["wildlife_spotting", "nature_photography"],
    price: 8500, no_of_days: 1, min_group_size: 2, max_group_size: 20
  },

  // ── WELLNESS ───────────────────────────────────────────────────
  {
    title: "Nuwara Eliya Spa Retreat",
    description: "Luxury Ayurvedic treatments, steam baths, and yoga in a colonial hill station setting.",
    location: "Nuwara Eliya", categories: ["wellness"],
    weather: ["cool", "humid"], interests: ["nature_photography"],
    price: 35000, no_of_days: 4, min_group_size: 1, max_group_size: 10
  },
  {
    title: "Bentota River Yoga Camp",
    description: "Daily yoga sessions beside the Bentota River with Ayurvedic meals and meditation classes.",
    location: "Bentota", categories: ["wellness"],
    weather: ["tropical", "sunny"], interests: ["paddling_boats", "nature_photography"],
    price: 28000, no_of_days: 4, min_group_size: 1, max_group_size: 12
  },
  {
    title: "Ella Mindfulness Retreat",
    description: "Digital detox retreat with guided meditation, forest bathing, and plant-based cuisine.",
    location: "Ella", categories: ["wellness", "eco"],
    weather: ["cool", "humid"], interests: ["hiking", "nature_photography"],
    price: 32000, no_of_days: 5, min_group_size: 1, max_group_size: 8
  },
  {
    title: "Galle Beachside Wellness",
    description: "Sunrise yoga, ocean swimming, Ayurvedic massage, and local herbal medicine walks.",
    location: "Galle", categories: ["wellness", "beach"],
    weather: ["sunny", "tropical"], interests: ["nature_photography", "diving"],
    price: 24000, no_of_days: 3, min_group_size: 1, max_group_size: 10
  },
  {
    title: "Colombo Urban Wellness Day",
    description: "City spa day with traditional herbal baths, reflexology, head massage, and healthy lunch.",
    location: "Colombo", categories: ["wellness"],
    weather: ["tropical", "humid"], interests: ["cultural_tours"],
    price: 9500, no_of_days: 1, min_group_size: 1, max_group_size: 8
  },
  {
    title: "Kandy Herbal Garden Walk",
    description: "Guided walk through a medicinal herb garden with Ayurvedic demonstrations and treatments.",
    location: "Kandy", categories: ["wellness", "cultural"],
    weather: ["cool", "humid"], interests: ["cultural_tours", "nature_photography"],
    price: 7500, no_of_days: 1, min_group_size: 1, max_group_size: 15
  },
  {
    title: "Matara Surf and Yoga",
    description: "Morning surf sessions combined with afternoon yoga and evening meditation on the beach.",
    location: "Matara", categories: ["wellness", "beach"],
    weather: ["sunny", "tropical"], interests: ["surfing", "nature_photography"],
    price: 18500, no_of_days: 4, min_group_size: 1, max_group_size: 10
  },
  {
    title: "Haputale Tea and Wellness",
    description: "Wellness retreat in a converted tea estate bungalow with yoga, nature walks, and tea therapy.",
    location: "Badulla", categories: ["wellness", "eco"],
    weather: ["cool", "humid"], interests: ["hiking", "nature_photography", "bird_watching"],
    price: 26000, no_of_days: 4, min_group_size: 1, max_group_size: 8
  },
  {
    title: "Negombo Lagoon Detox",
    description: "Lagoon boat rides, mangrove walks, fresh seafood, and sunset Ayurvedic massage sessions.",
    location: "Negombo", categories: ["wellness", "eco"],
    weather: ["tropical", "sunny"], interests: ["paddling_boats", "nature_photography"],
    price: 15000, no_of_days: 3, min_group_size: 1, max_group_size: 12
  },
  {
    title: "Dikwella Sound Healing Retreat",
    description: "Tibetan singing bowl therapy, breathwork, and restorative yoga by the Indian Ocean.",
    location: "Matara", categories: ["wellness"],
    weather: ["sunny", "tropical"], interests: ["nature_photography"],
    price: 21000, no_of_days: 3, min_group_size: 1, max_group_size: 8
  },

  // ── ECO ────────────────────────────────────────────────────────
  {
    title: "Sinharaja Eco Lodge Stay",
    description: "Stay in a sustainable eco lodge on the edge of Sinharaja and explore the primary rainforest.",
    location: "Ratnapura", categories: ["eco", "wildlife"],
    weather: ["humid", "rainy"], interests: ["bird_watching", "hiking", "nature_photography"],
    price: 26000, no_of_days: 3, min_group_size: 2, max_group_size: 8
  },
  {
    title: "Mangrove Kayak Expedition",
    description: "Kayak through the Puttalam lagoon mangroves spotting kingfishers, herons, and sea eagles.",
    location: "Negombo", categories: ["eco"],
    weather: ["tropical", "sunny"], interests: ["paddling_boats", "bird_watching", "nature_photography"],
    price: 8500, no_of_days: 1, min_group_size: 1, max_group_size: 12
  },
  {
    title: "Riverine Eco Camp Walawe",
    description: "Camp beside the Walawe River with night sky sessions, wildlife walks, and riverside cooking.",
    location: "Hambantota", categories: ["eco", "adventure"],
    weather: ["dry", "sunny"], interests: ["camping", "stargazing", "wildlife_spotting"],
    price: 16500, no_of_days: 2, min_group_size: 2, max_group_size: 10
  },
  {
    title: "Kandalama Eco Resort Trek",
    description: "Trek around the ancient Kandalama reservoir through scrub jungle with endemic bird spotting.",
    location: "Dambulla", categories: ["eco", "wildlife"],
    weather: ["dry", "sunny"], interests: ["bird_watching", "hiking", "nature_photography"],
    price: 13000, no_of_days: 2, min_group_size: 1, max_group_size: 12
  },
  {
    title: "Maduru Oya Wilderness Camp",
    description: "Remote camping in Maduru Oya National Park with elephant and crocodile spotting.",
    location: "Ampara", categories: ["eco", "wildlife"],
    weather: ["dry", "sunny"], interests: ["camping", "wildlife_spotting", "nature_photography"],
    price: 20000, no_of_days: 3, min_group_size: 2, max_group_size: 8
  },
  {
    title: "Ella River Eco Tubing",
    description: "Float down the Ella River through jungle gorges on inner tubes with picnic stops.",
    location: "Ella", categories: ["eco", "adventure"],
    weather: ["cool", "humid"], interests: ["paddling_boats", "nature_photography"],
    price: 7000, no_of_days: 1, min_group_size: 2, max_group_size: 15
  },
  {
    title: "Gal Oya Boat Safari",
    description: "Boat safari on Senanayake Samudra to watch elephants swimming and bathing in the lake.",
    location: "Ampara", categories: ["eco", "wildlife"],
    weather: ["dry", "sunny"], interests: ["wildlife_spotting", "paddling_boats", "nature_photography"],
    price: 18000, no_of_days: 2, min_group_size: 2, max_group_size: 10
  },
  {
    title: "Udawattekele Forest Walk",
    description: "Guided nature walk in the royal forest sanctuary above Kandy with endemic birds and plants.",
    location: "Kandy", categories: ["eco"],
    weather: ["cool", "humid"], interests: ["bird_watching", "hiking", "nature_photography"],
    price: 5500, no_of_days: 1, min_group_size: 1, max_group_size: 15
  },
  {
    title: "Rekawa Lagoon Night Kayak",
    description: "Twilight kayak through the bioluminescent Rekawa lagoon with turtle nesting walk after.",
    location: "Hambantota", categories: ["eco", "wildlife"],
    weather: ["tropical", "sunny"], interests: ["paddling_boats", "wildlife_spotting", "nature_photography"],
    price: 9500, no_of_days: 1, min_group_size: 2, max_group_size: 10
  },
  {
    title: "Victoria Reservoir Cycling",
    description: "Scenic cycling trail around the Victoria Reservoir through villages and pine plantations.",
    location: "Kandy", categories: ["eco", "adventure"],
    weather: ["cool", "humid"], interests: ["cycling", "nature_photography", "bird_watching"],
    price: 8000, no_of_days: 1, min_group_size: 1, max_group_size: 15
  },

  // ── FAMILY ─────────────────────────────────────────────────────
  {
    title: "Pinnawala Elephant Orphanage",
    description: "Watch and interact with the elephant herd at the famous Pinnawala Elephant Orphanage.",
    location: "Kandy", categories: ["family", "wildlife"],
    weather: ["tropical", "humid"], interests: ["wildlife_spotting", "nature_photography"],
    price: 8500, no_of_days: 1, min_group_size: 1, max_group_size: 30
  },
  {
    title: "Colombo Family Explorer",
    description: "Viharamahadevi Park, Colombo Zoo, National Museum, and Floating Market in one day.",
    location: "Colombo", categories: ["family", "cultural"],
    weather: ["tropical", "humid"], interests: ["cultural_tours", "nature_photography"],
    price: 9000, no_of_days: 1, min_group_size: 2, max_group_size: 25
  },
  {
    title: "Bentota Beach Family Fun",
    description: "Jet skiing, banana boat rides, glass-bottom boat, and river safari for the whole family.",
    location: "Bentota", categories: ["family", "beach"],
    weather: ["sunny", "tropical"], interests: ["paddling_boats", "wildlife_spotting"],
    price: 15000, no_of_days: 2, min_group_size: 2, max_group_size: 20
  },
  {
    title: "Kandy Scenic Train Ride",
    description: "The legendary Kandy to Ella train journey through tea estates, tunnels, and waterfalls.",
    location: "Kandy", categories: ["family", "eco"],
    weather: ["cool", "humid"], interests: ["nature_photography", "cultural_tours"],
    price: 7500, no_of_days: 2, min_group_size: 1, max_group_size: 30
  },
  {
    title: "Negombo Family Beach Stay",
    description: "Safe shallow beach for children, fish market visit, lagoon boat ride, and seafood dinner.",
    location: "Negombo", categories: ["family", "beach"],
    weather: ["tropical", "sunny"], interests: ["paddling_boats", "wildlife_spotting"],
    price: 12000, no_of_days: 2, min_group_size: 2, max_group_size: 20
  },
  {
    title: "Sigiriya & Minneriya Family",
    description: "Rock fortress climb in the morning and elephant safari in the afternoon for all ages.",
    location: "Sigiriya", categories: ["family", "wildlife", "historical"],
    weather: ["sunny", "dry"], interests: ["wildlife_spotting", "hiking", "cultural_tours"],
    price: 22000, no_of_days: 2, min_group_size: 2, max_group_size: 20
  },
  {
    title: "Dambulla Cave & Spice Garden",
    description: "Cave temple visit, spice garden tour with tastings, and elephant back safari for families.",
    location: "Dambulla", categories: ["family", "cultural"],
    weather: ["dry", "sunny"], interests: ["cultural_tours", "nature_photography"],
    price: 13500, no_of_days: 2, min_group_size: 2, max_group_size: 20
  },
  {
    title: "Ella Family Adventure",
    description: "Nine Arch Bridge photo stop, Little Adam's Peak easy hike, and train ride for families.",
    location: "Ella", categories: ["family", "adventure"],
    weather: ["cool", "humid"], interests: ["hiking", "nature_photography"],
    price: 17000, no_of_days: 3, min_group_size: 2, max_group_size: 15
  },
  {
    title: "Batticaloa Lagoon Family Tour",
    description: "Singing fish lagoon boat ride, fort visit, and bicycle tour of the island city.",
    location: "Batticaloa", categories: ["family", "cultural"],
    weather: ["sunny", "tropical"], interests: ["paddling_boats", "cycling", "cultural_tours"],
    price: 11000, no_of_days: 2, min_group_size: 2, max_group_size: 20
  },
  {
    title: "Udawalawe Family Safari",
    description: "Morning elephant safari, ETH feeding visit, and nature walk suitable for young children.",
    location: "Udawalawe", categories: ["family", "wildlife"],
    weather: ["dry", "sunny"], interests: ["wildlife_spotting", "nature_photography"],
    price: 19000, no_of_days: 2, min_group_size: 2, max_group_size: 15
  },

  // ── MIXED / MULTI-LOCATION ─────────────────────────────────────
  {
    title: "Classic Sri Lanka Circuit",
    description: "The ultimate island tour — Colombo, Kandy, Sigiriya, Dambulla, Ella, Yala, and Galle.",
    location: "Multi-location", categories: ["cultural", "historical", "wildlife"],
    weather: ["sunny", "tropical", "cool"], interests: ["cultural_tours", "wildlife_spotting", "nature_photography"],
    price: 85000, no_of_days: 14, min_group_size: 1, max_group_size: 20
  },
  {
    title: "North Sri Lanka Explorer",
    description: "Jaffna peninsula, Nainativu island, Nagadeepa temple, and the remote northern beaches.",
    location: "Jaffna", categories: ["cultural", "historical", "beach"],
    weather: ["dry", "sunny"], interests: ["cultural_tours", "nature_photography", "paddling_boats"],
    price: 28000, no_of_days: 4, min_group_size: 2, max_group_size: 15
  },
  {
    title: "East Coast Surf and Wild",
    description: "Surf Arugam Bay, safari Kumana, and relax on the empty beaches of the east coast.",
    location: "Arugam Bay", categories: ["beach", "wildlife", "adventure"],
    weather: ["sunny", "tropical"], interests: ["surfing", "wildlife_spotting", "bird_watching"],
    price: 32000, no_of_days: 5, min_group_size: 1, max_group_size: 12
  },
  {
    title: "Highland to Coast Journey",
    description: "Train through hill country from Nuwara Eliya to Ella then down to the south coast beaches.",
    location: "Multi-location", categories: ["eco", "beach", "adventure"],
    weather: ["cool", "sunny", "tropical"], interests: ["hiking", "nature_photography", "diving"],
    price: 38000, no_of_days: 6, min_group_size: 1, max_group_size: 15
  },
  {
    title: "Ancient Cities Grand Tour",
    description: "Comprehensive tour of all five ancient capitals — Anuradhapura, Polonnaruwa, Sigiriya, Kandy, and Yapahuwa.",
    location: "Multi-location", categories: ["historical", "cultural"],
    weather: ["dry", "sunny"], interests: ["cultural_tours", "nature_photography", "cycling"],
    price: 45000, no_of_days: 7, min_group_size: 1, max_group_size: 20
  },
  {
    title: "Sri Lanka Birdwatching Circuit",
    description: "Expert birding tour through Sinharaja, Horton Plains, Kumana, and Bundala targeting 200+ species.",
    location: "Multi-location", categories: ["wildlife", "eco"],
    weather: ["humid", "sunny", "cool"], interests: ["bird_watching", "nature_photography", "hiking"],
    price: 55000, no_of_days: 8, min_group_size: 2, max_group_size: 8
  },
  {
    title: "Sri Lanka Cycling Odyssey",
    description: "Cycle from Colombo to Galle along the coastal road stopping at temples, lagoons, and markets.",
    location: "Multi-location", categories: ["adventure", "eco"],
    weather: ["sunny", "tropical"], interests: ["cycling", "nature_photography", "cultural_tours"],
    price: 29000, no_of_days: 5, min_group_size: 2, max_group_size: 12
  },
  {
    title: "Stargazing Dark Sky Tour",
    description: "Multi-night tour to Sri Lanka's best stargazing spots — Knuckles, Horton Plains, and Yala.",
    location: "Multi-location", categories: ["eco", "adventure"],
    weather: ["cool", "dry"], interests: ["stargazing", "camping", "nature_photography"],
    price: 34000, no_of_days: 4, min_group_size: 2, max_group_size: 8
  },
  {
    title: "Photography Master Tour",
    description: "Professional photography-focused tour — Sigiriya sunrise, tea estate mist, Ella train, Yala leopard.",
    location: "Multi-location", categories: ["eco", "wildlife", "cultural"],
    weather: ["cool", "sunny", "humid"], interests: ["nature_photography", "wildlife_spotting", "cultural_tours"],
    price: 62000, no_of_days: 10, min_group_size: 2, max_group_size: 8
  },
  {
    title: "Honeymoon Island Special",
    description: "Romantic journey — Galle fort at sunset, whale watching, candlelit beach dinner, and hillside yoga.",
    location: "Multi-location", categories: ["beach", "wellness"],
    weather: ["sunny", "tropical"], interests: ["nature_photography", "diving", "wildlife_spotting"],
    price: 75000, no_of_days: 8, min_group_size: 2, max_group_size: 2
  },
  {
    title: "Budget Backpacker Circuit",
    description: "Cover the highlights on a shoestring — hostels, local buses, street food, and free beaches.",
    location: "Multi-location", categories: ["adventure", "cultural"],
    weather: ["tropical", "sunny"], interests: ["hiking", "cultural_tours", "nature_photography"],
    price: 15000, no_of_days: 10, min_group_size: 1, max_group_size: 6
  },
  {
    title: "Ampara Rural Village Stay",
    description: "Live with a farming family, help with paddy harvesting, and explore the rural east.",
    location: "Ampara", categories: ["cultural", "eco"],
    weather: ["sunny", "dry"], interests: ["cultural_tours", "cycling", "bird_watching"],
    price: 12000, no_of_days: 3, min_group_size: 1, max_group_size: 8
  },
  {
    title: "Matara Fort and Coast",
    description: "Explore the Dutch Matara Fort, star fort, Polhena reef snorkeling, and Dondra lighthouse.",
    location: "Matara", categories: ["historical", "beach"],
    weather: ["sunny", "tropical"], interests: ["cultural_tours", "diving", "nature_photography"],
    price: 10000, no_of_days: 2, min_group_size: 1, max_group_size: 20
  },
  {
    title: "Badulla Waterfalls Circuit",
    description: "Visit Dunhinda, Diyaluma, Ravana, and Bambarakanda falls in a single highland circuit.",
    location: "Badulla", categories: ["eco", "adventure"],
    weather: ["cool", "humid"], interests: ["hiking", "nature_photography", "camping"],
    price: 16000, no_of_days: 3, min_group_size: 2, max_group_size: 12
  },
  {
    title: "Polonnaruwa Cycle & Culture",
    description: "Cycle the ancient city ruins at sunrise, visit the elephant bath at the reservoir, and kayak.",
    location: "Polonnaruwa", categories: ["historical", "eco"],
    weather: ["dry", "sunny"], interests: ["cycling", "cultural_tours", "paddling_boats"],
    price: 11500, no_of_days: 2, min_group_size: 1, max_group_size: 15
  },
  {
    title: "Diyaluma Falls & Pool Trek",
    description: "Trek to the natural infinity pool above Sri Lanka's second highest waterfall.",
    location: "Badulla", categories: ["adventure", "eco"],
    weather: ["cool", "humid"], interests: ["hiking", "nature_photography", "camping"],
    price: 10500, no_of_days: 2, min_group_size: 2, max_group_size: 10
  },
  {
    title: "Kaudulla Elephant Corridor",
    description: "Jeep safari through Kaudulla National Park where elephant herds migrate between parks.",
    location: "Polonnaruwa", categories: ["wildlife", "eco"],
    weather: ["dry", "sunny"], interests: ["wildlife_spotting", "nature_photography"],
    price: 14500, no_of_days: 2, min_group_size: 2, max_group_size: 10
  },
  {
    title: "Jaffna Island Hopping",
    description: "Boat trips to Nainativu, Delft, and Karaitivu islands with temples, wild ponies, and coral.",
    location: "Jaffna", categories: ["cultural", "eco", "historical"],
    weather: ["dry", "sunny"], interests: ["paddling_boats", "cultural_tours", "wildlife_spotting"],
    price: 19000, no_of_days: 3, min_group_size: 2, max_group_size: 12
  },
  {
    title: "Colombo Sunset Catamaran",
    description: "Evening catamaran sail along the Colombo coastline with drinks, live music, and dolphin spotting.",
    location: "Colombo", categories: ["beach", "wellness"],
    weather: ["tropical", "sunny"], interests: ["paddling_boats", "wildlife_spotting", "nature_photography"],
    price: 8000, no_of_days: 1, min_group_size: 2, max_group_size: 20
  },
  {
    title: "Haputale Ridge Walk",
    description: "Walk along the dramatic Haputale ridge with 360-degree views over the southern plains.",
    location: "Badulla", categories: ["adventure", "eco"],
    weather: ["cool", "humid"], interests: ["hiking", "nature_photography", "bird_watching"],
    price: 9000, no_of_days: 2, min_group_size: 1, max_group_size: 12
  },
  {
    title: "Pottuvil Lagoon Sunrise Paddle",
    description: "Dawn kayak through Pottuvil lagoon mangroves with crocodiles, kingfishers, and otters.",
    location: "Arugam Bay", categories: ["eco", "wildlife"],
    weather: ["sunny", "tropical"], interests: ["paddling_boats", "wildlife_spotting", "bird_watching"],
    price: 7500, no_of_days: 1, min_group_size: 2, max_group_size: 10
  },
  {
    title: "Mullaitivu Beach & Memorial",
    description: "Visit the remote northern beaches, war memorial sites, and lagoon boat safari.",
    location: "Jaffna", categories: ["historical", "beach"],
    weather: ["sunny", "dry"], interests: ["cultural_tours", "nature_photography"],
    price: 20000, no_of_days: 3, min_group_size: 2, max_group_size: 12
  },
  {
    title: "Weerawila Wetland Birding",
    description: "Early morning birding walk at Weerawila tank — one of Sri Lanka's top waterbird sites.",
    location: "Hambantota", categories: ["wildlife", "eco"],
    weather: ["dry", "sunny"], interests: ["bird_watching", "nature_photography"],
    price: 7000, no_of_days: 1, min_group_size: 1, max_group_size: 10
  },
  {
    title: "Hikkaduwa Full Moon Party",
    description: "Beach bonfire, fire dancing, live reggae, and full moon celebration on Hikkaduwa beach.",
    location: "Hikkaduwa", categories: ["beach", "cultural"],
    weather: ["tropical", "sunny"], interests: ["cultural_tours", "nature_photography"],
    price: 6500, no_of_days: 1, min_group_size: 1, max_group_size: 30
  },
  {
    title: "Ratnapura Gem Mine Tour",
    description: "Visit a working gem mine, watch gem cutting, and learn about Sri Lanka's legendary sapphires.",
    location: "Ratnapura", categories: ["cultural", "historical"],
    weather: ["humid", "rainy"], interests: ["cultural_tours", "nature_photography"],
    price: 8000, no_of_days: 1, min_group_size: 1, max_group_size: 15
  },
  {
    title: "Knuckles Camping & Stars",
    description: "Two-night camping expedition in the Knuckles range with fire cooking and stargazing nights.",
    location: "Kandy", categories: ["adventure", "eco"],
    weather: ["cool", "humid"], interests: ["camping", "stargazing", "hiking", "nature_photography"],
    price: 24000, no_of_days: 3, min_group_size: 2, max_group_size: 8
  },
  {
    title: "Nainativu Temple Pilgrimage",
    description: "Boat journey to the sacred Nainativu island to visit the Nagapooshani Amman temple.",
    location: "Jaffna", categories: ["cultural", "historical"],
    weather: ["dry", "sunny"], interests: ["paddling_boats", "cultural_tours"],
    price: 9000, no_of_days: 1, min_group_size: 1, max_group_size: 20
  },
  {
    title: "Mahiyanganaya Ancient Temple",
    description: "Visit one of the oldest Buddhist sites in Sri Lanka beside the Mahaweli River.",
    location: "Ampara", categories: ["historical", "cultural"],
    weather: ["sunny", "dry"], interests: ["cultural_tours", "nature_photography"],
    price: 8500, no_of_days: 1, min_group_size: 1, max_group_size: 20
  },
  {
    title: "Yala Camping Under Stars",
    description: "Exclusive two-night tented camp inside Yala buffer zone with campfire dinners and dawn safaris.",
    location: "Yala", categories: ["wildlife", "adventure", "eco"],
    weather: ["dry", "sunny"], interests: ["camping", "wildlife_spotting", "stargazing", "nature_photography"],
    price: 42000, no_of_days: 3, min_group_size: 2, max_group_size: 8
  },
];


async function seed() {
  await mongoose.connect(process.env.Mongo_Url);
  const inserted = await Package.insertMany(sriLankaPackages);
  console.log(`✅ Inserted ${inserted.length} packages`);
  mongoose.disconnect();
}
seed().catch(console.error);