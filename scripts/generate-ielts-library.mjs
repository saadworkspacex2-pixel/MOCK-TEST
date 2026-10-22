// Generates 20 original, full-length IELTS-format practice tests (40 questions each).
// Content is original and Cambridge-style in structure, not copied Cambridge material.
import { writeFileSync } from "node:fs";

const reading = [
  {
    title: "When Wetlands Return to the City",
    text: `For much of the twentieth century, urban wetlands were treated as inconvenient obstacles to construction. Draining them created land for roads and housing, but it also removed a natural system that had absorbed heavy rainfall. As cities expanded, water that once disappeared into marshy ground rushed into drains instead, increasing the risk of flash floods.\n\nRecently, planners have begun restoring wetlands rather than replacing them. Reeds and other aquatic plants slow the movement of water, while their roots create spaces in the soil where moisture can collect. These habitats also support birds and insects, giving residents contact with wildlife without leaving the city.\n\nRestoration is not simply a matter of digging a pond. Engineers must understand where water enters and leaves the site, and local volunteers often help monitor plants and animals. Although some projects are expensive, researchers argue that avoided flood damage can make them economical over time.`,
    sequence: ["Drainage of natural wetlands", "Expansion of impermeable city surfaces", "Restoration of aquatic habitats", "Monitoring by engineers and volunteers"],
    headings: ["The hidden cost of building on wetlands", "A complete history of urban transport", "Why cities should ban agriculture", "The commercial value of rare birds"],
    headingCorrect: 0,
    purpose: { options: ["To explain why wetland restoration can benefit cities", "To describe a single engineering experiment", "To criticise all urban development", "To compare bird migration routes"], correct: 0 },
    facts: [
      { statement: "Early urban development often involved draining wetlands.", tfng: 0, q: "Why were wetlands drained in many cities?", options: ["To create space for construction", "To attract more birds", "To improve drinking water", "To reduce road traffic"], correct: 0, gap: "Draining wetlands created land for roads and ______.", accepted: "housing|houses", why: "The passage says draining created land for roads and housing." },
      { statement: "Restored wetlands always eliminate flooding completely.", tfng: 1, q: "What is one cause of increased flash-flood risk?", options: ["More wetlands", "Water rushing into drains", "Additional tree roots", "More public parks"], correct: 1, gap: "Reeds and aquatic plants slow the movement of ______.", accepted: "water|rainwater", why: "Restored wetlands reduce risk, but the passage does not claim they eliminate all flooding." },
      { statement: "Residents never encounter wildlife in restored wetlands.", tfng: 1, q: "What do aquatic plant roots do?", options: ["Raise air temperature", "Create spaces where moisture collects", "Stop all soil erosion", "Remove every pollutant"], correct: 1, gap: "The roots create spaces in the soil where ______ can collect.", accepted: "moisture|water", why: "The passage explicitly describes roots creating spaces for moisture." },
      { statement: "The passage states the exact cost of every restoration project.", tfng: 2, q: "Who may assist with monitoring restored sites?", options: ["Only tourists", "Local volunteers", "Construction companies only", "International airlines"], correct: 1, gap: "Local volunteers often help monitor plants and ______.", accepted: "animals|animal species", why: "Costs are described generally, not as exact figures for every project." },
    ],
  },
  {
    title: "Sleep and the Work of Memory",
    text: `Sleep is sometimes described as a period in which the brain simply switches off. Research suggests a more complicated picture. During the night, the brain cycles through several stages, and each appears to contribute differently to learning and emotional regulation.\n\nOne area of interest is memory consolidation. After people practise a new skill, certain patterns of brain activity associated with that skill may reappear during sleep. This replay is thought to strengthen useful connections, making recall more reliable the following day. A single short night does not destroy memory, but repeated sleep loss can make learning less efficient.\n\nScientists also study how sleep affects attention. Even when tired people believe they are performing normally, brief lapses can occur without their awareness. For this reason, researchers recommend consistent sleep routines rather than relying on occasional long weekends to recover.`,
    sequence: ["Practice of a new skill", "Replay of related brain activity", "Strengthening of memory connections", "More reliable recall"],
    headings: ["Why sleep is unnecessary for adults", "The active role of sleep in learning", "A history of alarm clocks", "The best weekend entertainment"],
    headingCorrect: 1,
    purpose: { options: ["To explain links between sleep, memory and attention", "To promote a particular mattress", "To prove dreams predict the future", "To describe hospital architecture"], correct: 0 },
    facts: [
      { statement: "The brain passes through different stages during sleep.", tfng: 0, q: "What happens to brain activity during sleep?", options: ["It follows several stages", "It stops completely", "It remains identical all night", "It only controls muscles"], correct: 0, gap: "During the night, the brain cycles through several ______.", accepted: "stages|sleep stages", why: "The opening section states that the brain cycles through several stages." },
      { statement: "Skill-related brain activity may reappear during sleep.", tfng: 0, q: "What may happen after a person practises a skill?", options: ["The skill is forgotten immediately", "Related brain activity may replay during sleep", "Attention becomes unnecessary", "All memories become permanent"], correct: 1, gap: "Replay is thought to strengthen useful ______.", accepted: "connections|brain connections", why: "The memory section describes replay strengthening useful connections." },
      { statement: "One short night permanently destroys all memories.", tfng: 1, q: "What can repeated sleep loss do?", options: ["Make learning less efficient", "Guarantee better recall", "Remove the need for practice", "Prevent emotional regulation"], correct: 0, gap: "Repeated sleep loss can make learning less ______.", accepted: "efficient", why: "The passage says one short night does not destroy memory, but repeated loss reduces efficiency." },
      { statement: "Tired people always notice every lapse in their attention.", tfng: 1, q: "What routine do researchers recommend?", options: ["Irregular sleep times", "Consistent sleep routines", "Only weekend sleep", "No nightly routine"], correct: 1, gap: "Brief attention lapses can occur without a person's ______.", accepted: "awareness|knowledge", why: "The passage says lapses can occur without awareness." },
    ],
  },
  {
    title: "The Growing Repair Economy",
    text: `Repairing a damaged appliance was once an ordinary part of household life. As mass-produced goods became cheaper, replacement often appeared easier than finding spare parts or a skilled technician. The resulting waste created pressure on landfill sites and increased demand for raw materials.\n\nCommunity repair cafés offer one response. Visitors bring broken objects and work alongside volunteers who share tools and practical knowledge. The aim is not only to fix an item but also to help owners understand how it works. Some cafés record the reasons for failure, providing useful information to manufacturers and campaigners.\n\nNew right-to-repair rules in several regions go further by requiring certain companies to supply parts and manuals. Critics worry about safety and intellectual property, while supporters argue that longer product lifetimes benefit both consumers and the environment.`,
    sequence: ["A product fails", "Owner visits a repair café", "Volunteer and owner investigate it", "Failure information is recorded"],
    headings: ["Why landfill is no longer a problem", "Repair as practical and environmental action", "The disappearance of all technicians", "A guide to buying more appliances"],
    headingCorrect: 1,
    purpose: { options: ["To discuss how repair can reduce waste and build skills", "To advertise a new appliance", "To oppose all manufacturing", "To compare international tax systems"], correct: 0 },
    facts: [
      { statement: "Cheaper replacement goods contributed to a decline in repair.", tfng: 0, q: "Why did replacement become more attractive?", options: ["Mass-produced goods became cheaper", "Technicians became more common", "Landfill sites disappeared", "Manuals became easier to read"], correct: 0, gap: "Replacement increased demand for raw ______.", accepted: "materials|raw materials", why: "The introduction links cheaper goods with more replacement and waste." },
      { statement: "Repair cafés only allow professional technicians to handle objects.", tfng: 1, q: "What do visitors do at repair cafés?", options: ["Watch without participating", "Work alongside volunteers", "Buy only new products", "Manufacture spare parts"], correct: 1, gap: "Visitors work alongside ______ who share tools and knowledge.", accepted: "volunteers|the volunteers", why: "Owners work with volunteers rather than merely watching professionals." },
      { statement: "Failure records can provide information to manufacturers.", tfng: 0, q: "What additional benefit can repair-café records provide?", options: ["Weather forecasts", "Information about product failure", "Free international shipping", "New landfill locations"], correct: 1, gap: "Some cafés record the reasons for ______.", accepted: "failure|product failure", why: "The passage says failure information can be useful to manufacturers and campaigners." },
      { statement: "Every region has identical right-to-repair legislation.", tfng: 2, q: "What concern do critics of right-to-repair mention?", options: ["Safety and intellectual property", "Excessive rainfall", "A shortage of volunteers", "Too much wildlife"], correct: 0, gap: "Supporters say longer product ______ benefit consumers and the environment.", accepted: "lifetimes|lifetime|lives", why: "The passage discusses several regions but gives no claim of identical laws everywhere." },
    ],
  },
  {
    title: "Citizen Science Beyond the Laboratory",
    text: `Scientific research does not always require a laboratory coat or an expensive institution. Citizen-science projects invite members of the public to collect observations, classify images or measure local conditions. With suitable training and clear protocols, volunteers can gather data across far wider areas than a small professional team could cover.\n\nBird counts are a familiar example. Thousands of participants record species on the same weekend, helping researchers identify changes in distribution over time. Similar projects monitor water quality, track insects and search astronomical photographs for unusual objects.\n\nLarge volunteer datasets still require careful checking. Organisers may ask experienced reviewers to inspect unusual records and provide feedback to contributors. When participants understand how their observations are used, they are more likely to remain involved and to improve the quality of future submissions.`,
    sequence: ["Volunteers receive a protocol", "Observations are collected", "Unusual records are reviewed", "Contributors receive feedback"],
    headings: ["Public participation in scientific discovery", "Why professional science has ended", "A guide to laboratory equipment", "The history of weekend entertainment"],
    headingCorrect: 0,
    purpose: { options: ["To explain how volunteers contribute to research", "To argue against professional scientists", "To describe a single bird species", "To promote a telescope brand"], correct: 0 },
    facts: [
      { statement: "Citizen science can cover areas difficult for a small professional team to reach.", tfng: 0, q: "What advantage can volunteers provide?", options: ["Wider geographic coverage", "Guaranteed perfect data", "Elimination of training", "Less need for protocols"], correct: 0, gap: "Volunteers need suitable training and clear ______.", accepted: "protocols|a protocol", why: "The first section links volunteer coverage with training and protocols." },
      { statement: "Bird counts can reveal changes in species distribution.", tfng: 0, q: "What can coordinated bird counts help identify?", options: ["Changes in distribution over time", "The price of telescopes", "New road designs", "The age of every participant"], correct: 0, gap: "Participants record bird ______ on the same weekend.", accepted: "species|bird species", why: "The bird-count example explicitly mentions changes in distribution." },
      { statement: "Volunteer datasets require no checking.", tfng: 1, q: "How do organisers handle unusual records?", options: ["Delete every submission", "Ask experienced reviewers to inspect them", "Publish without review", "Hide them from researchers"], correct: 1, gap: "Experienced ______ may inspect unusual records.", accepted: "reviewers|reviewer", why: "The final section stresses careful checking by experienced reviewers." },
      { statement: "Participants always stop contributing after receiving feedback.", tfng: 2, q: "What encourages continued participation?", options: ["Understanding how observations are used", "Keeping results secret", "Removing all training", "Avoiding feedback"], correct: 0, gap: "Feedback can improve the quality of future ______.", accepted: "submissions|observations", why: "The passage links understanding and feedback with continued involvement, not its frequency." },
    ],
  },
  {
    title: "Growing Food with Less Water",
    text: `Agriculture in dry regions has always depended on careful management of water. Traditional farmers selected planting dates around seasonal rain and shaped fields to reduce runoff. Modern projects are combining such knowledge with sensors that measure soil moisture.\n\nDrip irrigation is one widely used technique. Instead of spraying water across an entire field, pipes deliver small amounts close to plant roots. This can reduce evaporation, although blocked nozzles and poor maintenance may limit its effectiveness. The technology is most successful when farmers receive training and replacement parts are available locally.\n\nResearchers also test crop varieties that tolerate heat and short dry periods. They caution that no single seed or device can solve every problem. Soil health, access to markets and fair water agreements all influence whether a farming community can remain resilient.`,
    sequence: ["Measure soil moisture", "Deliver water near roots", "Maintain irrigation equipment", "Evaluate crop resilience"],
    headings: ["Water-wise farming as a complete system", "Why deserts have no agriculture", "The invention of plastic pipes", "A comparison of restaurant menus"],
    headingCorrect: 0,
    purpose: { options: ["To show that water-efficient farming needs several forms of support", "To claim sensors make rain unnecessary", "To describe only one crop", "To oppose local training"], correct: 0 },
    facts: [
      { statement: "Traditional farmers sometimes shaped fields to reduce runoff.", tfng: 0, q: "What modern tool is combined with traditional knowledge?", options: ["Soil-moisture sensors", "Aircraft engines", "Traffic cameras", "Hospital scanners"], correct: 0, gap: "Sensors measure soil ______.", accepted: "moisture|water content", why: "The first section explicitly mentions shaping fields and modern sensors." },
      { statement: "Drip irrigation sprays water over the whole field.", tfng: 1, q: "Where does drip irrigation deliver water?", options: ["Into the air", "Close to plant roots", "Onto nearby roads", "Only into storage tanks"], correct: 1, gap: "Drip irrigation can reduce ______.", accepted: "evaporation|water evaporation", why: "The passage contrasts root delivery with spraying an entire field." },
      { statement: "Maintenance can affect the performance of drip systems.", tfng: 0, q: "What can limit drip irrigation?", options: ["Blocked nozzles and poor maintenance", "Too much training", "Local spare parts", "Healthy soil"], correct: 0, gap: "Replacement ______ should be available locally.", accepted: "parts|spare parts", why: "Blocked nozzles and poor maintenance are named as limitations." },
      { statement: "The passage claims one crop variety will solve every agricultural problem.", tfng: 1, q: "Besides seeds and devices, what affects resilience?", options: ["Soil health and water agreements", "Only farm colour", "Television schedules", "Building height"], correct: 0, gap: "Researchers say no single seed or ______ can solve every problem.", accepted: "device|technology", why: "Researchers explicitly reject a single-device solution." },
    ],
  },
  {
    title: "Public Libraries in a Digital Age",
    text: `Predictions that public libraries would disappear as information moved online have proved premature. Many libraries now lend digital books alongside printed ones, but their role extends beyond storage. They provide internet access, study space and assistance for people who are unfamiliar with online services.\n\nStaff increasingly act as guides to digital information. A reader may ask for help evaluating a website, completing an official form or joining a video call. These services are particularly valuable where home internet is unreliable or devices are shared among family members.\n\nLibraries must nevertheless make choices about limited budgets. Some reduce opening hours while others form partnerships with schools and community groups. Supporters argue that measuring success only by book loans misses the social and educational value of a free, welcoming public space.`,
    sequence: ["A visitor requests help", "Staff identify the digital need", "Guidance or access is provided", "The visitor completes a task"],
    headings: ["The end of printed books", "Libraries as digital and social support", "A history of online shopping", "Why public space should be expensive"],
    headingCorrect: 1,
    purpose: { options: ["To explain the evolving role of public libraries", "To argue that books are obsolete", "To compare commercial bookshops", "To promote a device manufacturer"], correct: 0 },
    facts: [
      { statement: "Many libraries lend both digital and printed books.", tfng: 0, q: "What do many libraries now offer?", options: ["Only printed newspapers", "Digital and printed books", "No online services", "Only commercial courses"], correct: 1, gap: "Libraries provide internet access, study space and ______.", accepted: "assistance|help", why: "The opening states that libraries lend digital books alongside printed ones." },
      { statement: "Library staff never help visitors assess websites.", tfng: 1, q: "How do staff increasingly help readers?", options: ["By acting as guides to digital information", "By selling computers", "By blocking official forms", "By preventing video calls"], correct: 0, gap: "Staff act as guides to digital ______.", accepted: "information|online information", why: "Evaluating websites is given as an example of staff guidance." },
      { statement: "Digital library services can help people with unreliable home internet.", tfng: 0, q: "Who may particularly benefit from these services?", options: ["People with unreliable home internet", "Only professional authors", "Only device manufacturers", "People who never use forms"], correct: 0, gap: "Devices may be shared among ______ members.", accepted: "family|families", why: "The passage identifies unreliable internet and shared devices as reasons services matter." },
      { statement: "All libraries have unlimited budgets.", tfng: 1, q: "How do some libraries respond to limited budgets?", options: ["Form community partnerships", "Stop all public services", "Remove every book", "Charge every visitor"], correct: 0, gap: "Success should not be measured only by book ______.", accepted: "loans|book loans", why: "The final section explicitly discusses limited budgets." },
    ],
  },
];

const listening = [
  {
    title: "Community Sports Centre Enquiry",
    text: `Receptionist: Good morning, Riverside Sports Centre. New members are welcome to visit for a free tour on weekday evenings. Our swimming pool opens at six in the morning, while the main sports hall opens at eight.\n\nCaller: I would like to book badminton for two people. Is equipment included?\nReceptionist: Court hire includes nets, but rackets cost three pounds each to rent. Please bring clean indoor shoes. If you book online before noon, the evening court costs twelve pounds instead of fifteen.\nCaller: Great. Can I park nearby?\nReceptionist: Yes, the public car park behind the centre is free for the first two hours.`,
    sequence: ["Telephone enquiry", "Court and equipment information", "Online booking", "Arrival by car"],
    headings: ["Booking a community sports facility", "A professional badminton tournament", "The history of swimming", "A review of sports shoes"],
    headingCorrect: 0,
    purpose: { options: ["To arrange a sports-centre visit and court", "To describe a tournament", "To compare swimming techniques", "To sell a car"], correct: 0 },
    facts: [
      { statement: "Free tours are available on weekday evenings.", tfng: 0, q: "When can new members take a free tour?", options: ["Weekday evenings", "Sunday mornings only", "Only at midnight", "Every public holiday"], correct: 0, gap: "The swimming pool opens at ______ in the morning.", accepted: "six|6|6 am|six am", why: "The receptionist offers free tours on weekday evenings." },
      { statement: "Court hire includes rackets at no extra charge.", tfng: 1, q: "What does court hire include?", options: ["Rackets", "Nets", "Indoor shoes", "Car parking"], correct: 1, gap: "Each racket costs ______ pounds to rent.", accepted: "three|3", why: "Nets are included, but rackets cost three pounds each." },
      { statement: "Online booking before noon reduces the evening court price.", tfng: 0, q: "How much is the discounted evening court?", options: ["Three pounds", "Twelve pounds", "Fifteen pounds", "Twenty pounds"], correct: 1, gap: "Booking online before ______ gives the lower price.", accepted: "noon|12 noon|midday", why: "The receptionist quotes twelve pounds instead of fifteen for qualifying online bookings." },
      { statement: "The public car park charges for the first two hours.", tfng: 1, q: "Where is the car park?", options: ["In front of the pool", "Behind the centre", "Beside the railway", "Under the sports hall"], correct: 1, gap: "Parking is free for the first two ______.", accepted: "hours|hour|2 hours", why: "The first two hours are free, not charged." },
    ],
  },
  {
    title: "Choosing a University Course",
    text: `Tutor: Before you select your modules, consider how you prefer to learn. The environmental-science course has one lecture and one field workshop each week. Assessment is sixty per cent coursework and forty per cent examination.\n\nStudent: I enjoy practical work, but I am worried about the statistics module.\nTutor: There is a support class on Thursday afternoons. You can also borrow the recommended textbook from the library; there is no need to buy it immediately. Your first field trip is to the coastal reserve on the second Friday of term.\nStudent: Do I need special clothing?\nTutor: Bring waterproof boots and a notebook. We will provide all measuring equipment.`,
    sequence: ["Review course structure", "Attend statistics support", "Prepare for coastal field trip", "Use provided measuring equipment"],
    headings: ["Planning study and fieldwork", "A guide to university accommodation", "The history of statistics", "Buying a new computer"],
    headingCorrect: 0,
    purpose: { options: ["To help a student prepare for a course", "To describe coastal wildlife", "To compare libraries", "To sell textbooks"], correct: 0 },
    facts: [
      { statement: "The course includes a weekly field workshop.", tfng: 0, q: "How many lectures are there each week?", options: ["One", "Two", "Three", "Four"], correct: 0, gap: "There is one lecture and one field ______ each week.", accepted: "workshop|field workshop", why: "The tutor describes one lecture and one field workshop weekly." },
      { statement: "Most of the assessment is based on the examination.", tfng: 1, q: "What proportion is coursework?", options: ["Forty per cent", "Fifty per cent", "Sixty per cent", "Eighty per cent"], correct: 2, gap: "The examination accounts for ______ per cent.", accepted: "forty|40|40 per cent|forty per cent", why: "Coursework is sixty per cent and examination forty per cent." },
      { statement: "Statistics support is available on Thursday afternoons.", tfng: 0, q: "Where can the student get the recommended textbook?", options: ["From the library", "Only from the tutor", "At the coastal reserve", "It is unavailable"], correct: 0, gap: "The first field trip is on the second ______ of term.", accepted: "Friday|friday", why: "The tutor offers a Thursday support class and a library copy." },
      { statement: "Students must buy their own measuring equipment.", tfng: 1, q: "What should the student bring?", options: ["Waterproof boots and a notebook", "A tent and cooking equipment", "A new laptop", "Measuring equipment"], correct: 0, gap: "The centre will provide all measuring ______.", accepted: "equipment", why: "The tutor says measuring equipment is provided." },
    ],
  },
  {
    title: "A Guided Museum Visit",
    text: `Guide: Welcome to the City Museum. Today’s highlights tour begins in the transport gallery on the ground floor. Please leave large bags in the free lockers beside the entrance. Photography is allowed without flash.\n\nVisitor: Where can we see the clock exhibition?\nGuide: That is in Room 14 on the second floor. We will spend twenty minutes there before stopping at the café. The café serves soup and sandwiches until three o’clock.\nVisitor: Are children given activity sheets?\nGuide: Yes, collect them from the information desk. There is also a quiet family room next to the shop.`,
    sequence: ["Leave bags in lockers", "Visit transport gallery", "See clocks in Room 14", "Stop at the café"],
    headings: ["Practical information for museum visitors", "The invention of clocks", "A review of museum cafés", "A guide to photography"],
    headingCorrect: 0,
    purpose: { options: ["To explain arrangements for a museum visit", "To describe clock mechanisms", "To compare museum shops", "To teach photography"], correct: 0 },
    facts: [
      { statement: "Large bags can be left in free lockers.", tfng: 0, q: "Where are the lockers?", options: ["Beside the entrance", "In Room 14", "Next to the café", "On the second floor"], correct: 0, gap: "The tour begins in the ______ gallery.", accepted: "transport|transport gallery", why: "The guide directs visitors to free lockers beside the entrance." },
      { statement: "Flash photography is permitted everywhere.", tfng: 1, q: "What photography rule applies?", options: ["No photography", "Photography without flash", "Flash is required", "Only staff may take photographs"], correct: 1, gap: "The clock exhibition is in Room ______.", accepted: "14|fourteen", why: "Photography is allowed only without flash." },
      { statement: "The tour spends twenty minutes at the clock exhibition.", tfng: 0, q: "Where does the tour stop after the clocks?", options: ["At the café", "At the lockers", "At the library", "At the car park"], correct: 0, gap: "The café serves soup and ______ until three o’clock.", accepted: "sandwiches|sandwich", why: "The guide specifies twenty minutes in Room 14 before the café." },
      { statement: "Activity sheets must be purchased from the shop.", tfng: 2, q: "Where can children’s activity sheets be collected?", options: ["From the information desk", "From the café", "From Room 14", "From the transport gallery"], correct: 0, gap: "The quiet family room is next to the ______.", accepted: "shop|museum shop", why: "The guide mentions collecting sheets but gives no information about payment." },
    ],
  },
  {
    title: "Changes to Local Transport",
    text: `Presenter: From next Monday, the number 26 bus will no longer stop outside the old hospital. Use the new stop beside the public library instead. Services will run every fifteen minutes during the day and every thirty minutes after nine in the evening.\n\nThe riverside cycle path will also be closed for repairs between the market bridge and the theatre. A signed diversion goes through Willow Park. Cyclists should allow an extra ten minutes for their journey.\n\nRail passengers should note that Sunday tickets can be booked online from today. Paper timetables will be available at the station from Friday.`,
    sequence: ["Bus stop relocation", "Cycle-path repair diversion", "Online Sunday rail booking", "Paper timetables at station"],
    headings: ["Upcoming changes for local travellers", "A history of public libraries", "The construction of a theatre", "A guide to buying bicycles"],
    headingCorrect: 0,
    purpose: { options: ["To announce local transport changes", "To promote a hospital", "To describe railway history", "To review a park"], correct: 0 },
    facts: [
      { statement: "The number 26 will stop beside the public library.", tfng: 0, q: "Which stop will be removed?", options: ["The old hospital stop", "The library stop", "The theatre stop", "The station stop"], correct: 0, gap: "Daytime buses will run every ______ minutes.", accepted: "fifteen|15", why: "The presenter tells passengers to use the new library stop." },
      { statement: "Evening buses after nine run every thirty minutes.", tfng: 0, q: "How often do buses run after 9 pm?", options: ["Every ten minutes", "Every fifteen minutes", "Every thirty minutes", "Every hour"], correct: 2, gap: "After nine in the evening, services run every ______ minutes.", accepted: "thirty|30", why: "The presenter states a thirty-minute frequency after nine." },
      { statement: "The cycle diversion passes through Willow Park.", tfng: 0, q: "How much extra journey time should cyclists allow?", options: ["Five minutes", "Ten minutes", "Twenty minutes", "Thirty minutes"], correct: 1, gap: "The cycle path is closed between the market bridge and the ______.", accepted: "theatre|theater", why: "The signed diversion goes through Willow Park." },
      { statement: "Sunday rail tickets cannot be booked online.", tfng: 1, q: "When will paper timetables be available?", options: ["Today", "Monday", "Friday", "Next Sunday"], correct: 2, gap: "Paper timetables will be available at the ______ from Friday.", accepted: "station|rail station|railway station", why: "Sunday tickets can be booked online from today." },
    ],
  },
];

const sqlString = (value) => `'${String(value).replace(/'/g, "''")}'`;

function makeItems(p, count) {
  const items = [];
  for (let i = 0; i < 3; i++) {
    const f = p.facts[i];
    items.push({ qtype: "tfng", text: f.statement, options: ["", "", "", ""], correct: f.tfng, accepted: "", explanation: f.why });
  }
  for (const f of p.facts) {
    items.push({ qtype: "mcq", text: f.q, options: f.options, correct: f.correct, accepted: "", explanation: f.why });
  }
  for (const f of p.facts) {
    items.push({ qtype: "gap", text: `Complete the summary with ONE OR TWO words: ${f.gap}`, options: ["", "", "", ""], correct: 0, accepted: f.accepted, explanation: f.why });
  }
  items.push({ qtype: "matching", text: "Choose the most suitable heading for this passage.", options: p.headings, correct: p.headingCorrect, accepted: "", explanation: "The correct heading captures the passage's main subject and purpose." });
  items.push({ qtype: "dnd", text: "Arrange the following stages in the order described in the passage.", options: p.sequence, correct: 0, accepted: "0,1,2,3", explanation: "The stages follow the sequence presented in the passage." });
  items.push({ qtype: "mcq", text: "What is the writer's or speaker's main purpose?", options: p.purpose.options, correct: p.purpose.correct, accepted: "", explanation: "This option best summarises the overall purpose rather than a minor detail." });
  return items.slice(0, count);
}

const examPlans = [];
for (let i = 1; i <= 12; i++) examPlans.push({ module: "reading", category: "Academic Practice Library", title: `Academic Reading Practice ${i}`, duration: 60, passages: [reading[(i - 1) % 6], reading[i % 6], reading[(i + 1) % 6]], counts: [13, 13, 14] });
for (let i = 1; i <= 4; i++) examPlans.push({ module: "reading", category: "General Training Practice Library", title: `General Training Reading Practice ${i}`, duration: 60, passages: [reading[(i + 2) % 6], reading[(i + 3) % 6], reading[(i + 4) % 6]], counts: [13, 13, 14] });
for (let i = 1; i <= 4; i++) examPlans.push({ module: "listening", category: "Listening Practice Library", title: `IELTS Listening Practice ${i}`, duration: 32, passages: [listening[(i - 1) % 4], listening[i % 4], listening[(i + 1) % 4], listening[(i + 2) % 4]], counts: [10, 10, 10, 10] });

let output = `-- 20 original full-length IELTS-format tests, 40 questions each.\nBEGIN;\nCREATE SCHEMA IF NOT EXISTS lhbd_app;\nSET LOCAL search_path TO lhbd_app;\n\nDELETE FROM exams WHERE category IN ('Academic Practice Library','General Training Practice Library','Listening Practice Library');\n\n`;

for (const plan of examPlans) {
  output += `DO $$\nDECLARE eid integer; ${plan.passages.map((_, i) => `s${i + 1} integer;`).join(" ")}\nBEGIN\n`;
  output += ` INSERT INTO exams (title,description,category,module,duration_minutes,marks_per_question,negative_mark,is_live,rules) VALUES (${sqlString(plan.title)},${sqlString(`Original full-length ${plan.module} practice with 40 questions, authentic timing and mixed IELTS question types.`)},${sqlString(plan.category)},${sqlString(plan.module)},${plan.duration},1,0,true,'{"showExplanations":true}'::jsonb) RETURNING id INTO eid;\n`;
  let start = 1;
  plan.passages.forEach((p, sectionIndex) => {
    const count = plan.counts[sectionIndex];
    const end = start + count - 1;
    const label = plan.module === "listening" ? `Section ${sectionIndex + 1}` : `Passage ${sectionIndex + 1}`;
    output += ` INSERT INTO sections (exam_id,title,passage_title,passage_text,instruction,audio_url,sort_order) VALUES (eid,${sqlString(label)},${sqlString(p.title)},${sqlString(p.text)},${sqlString(`Questions ${start}–${end}: Read or listen carefully and answer every question.`)},'',${sectionIndex + 1}) RETURNING id INTO s${sectionIndex + 1};\n`;
    const items = makeItems(p, count);
    output += ` INSERT INTO questions (exam_id,section_id,qtype,text,option_a,option_b,option_c,option_d,correct_option,accepted_answers,explanation,sort_order) VALUES\n`;
    output += items.map((q, itemIndex) => `  (eid,s${sectionIndex + 1},${sqlString(q.qtype)},${sqlString(q.text)},${q.options.map(sqlString).join(",")},${q.correct},${sqlString(q.accepted)},${sqlString(q.explanation)},${start + itemIndex})`).join(",\n");
    output += `;\n`;
    start = end + 1;
  });
  output += `END $$;\n\n`;
}

output += `COMMIT;\n`;
writeFileSync(new URL("./ielts-library.sql", import.meta.url), output);
console.log(`Generated ${examPlans.length} tests with ${examPlans.reduce((sum, p) => sum + p.counts.reduce((a, b) => a + b, 0), 0)} questions.`);
