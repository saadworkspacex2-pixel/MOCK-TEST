-- Full reseed with module-based exams (original content)
BEGIN;
CREATE SCHEMA IF NOT EXISTS lhbd_app;
SET LOCAL search_path TO lhbd_app;

TRUNCATE attempts, questions, sections, exams, resources RESTART IDENTITY CASCADE;

-- ============ EXAM 1: Academic Reading Mock 1 ============
INSERT INTO exams (title, description, category, module, duration_minutes, marks_per_question, negative_mark, is_live)
VALUES ('Academic Reading মক টেস্ট — ১', 'কম্পিউটার-ডেলিভার্ড পরীক্ষার মতো স্ক্রিন: বাঁয়ে প্যাসেজ, ডানে প্রশ্ন, একই ঘড়ি। জমা দেওয়ার সঙ্গে সঙ্গেই ব্যান্ড স্কোর।', 'IELTS Reading', 'reading', 20, 1, 0, true);

INSERT INTO sections (exam_id, title, passage_title, passage_text, instruction, sort_order) VALUES
(1, 'Passage 1', 'The Secret Life of Honeybees',
'Honeybees are among the most studied insects on Earth, and for good reason. A single colony may contain up to sixty thousand individuals, yet it operates with a level of coordination that many human organisations would envy. Each bee takes on different roles during its short life: cleaning cells as a young worker, nursing larvae, guarding the entrance, and finally foraging for nectar and pollen in the last weeks of its life.

Perhaps the most remarkable behaviour of honeybees is their system of communication. When a forager discovers a rich source of food, she returns to the hive and performs what scientists call a "waggle dance". The angle of the dance in relation to the vertical honeycomb indicates the direction of the food relative to the sun, while the duration of the waggle phase signals the distance. Other foragers read this information in the darkness of the hive through touch and vibration, then fly out to the advertised location.

Honeybees also make collective decisions. When a colony becomes too large, roughly half the bees leave with the old queen to find a new home. Scout bees investigate potential nest sites and report back, again through dancing. Over several days, the scouts effectively hold a debate: dances for better sites attract more supporters, until a consensus emerges and the swarm flies off together.

However, honeybee populations face serious pressures. Changing farming practices have reduced the variety of flowers available, while certain chemicals used on crops can impair the bees'' ability to navigate. Researchers warn that protecting these pollinators is not merely a matter of saving an interesting insect; around one third of the food crops humans grow depend to some degree on insect pollination.',
'Questions 1–8: প্যাসেজ পড়ে উত্তর দিন।', 1),
(1, 'Passage 2', 'Cities That Breathe: The Rise of Urban Forests',
'In the middle of many crowded cities, a quiet transformation is taking place. Local governments from Singapore to Milan are planting dense pockets of trees — sometimes called urban forests — on rooftops, along avenues, and in abandoned lots. The goal is not simply decoration. Trees lower the surrounding air temperature by providing shade and by releasing water vapour from their leaves, a process known as transpiration. On a hot afternoon, the difference between a bare street and a tree-lined one can be several degrees.

The benefits go beyond cooling. Leaves trap airborne dust, and the soil around tree roots absorbs rainwater that would otherwise flood drains during storms. Studies of hospital patients have even suggested that a view of greenery can shorten recovery times, although scientists continue to debate how strong this effect really is.

Urban forestry is not without challenges. Tree roots can crack pavements, falling branches pose risks, and watering young trees during dry summers is costly. Some critics also point out that planting programmes often favour wealthy neighbourhoods, leaving poorer districts with little shade. City planners increasingly respond by mapping tree cover street by street and directing new planting to the areas that need it most.

What was once considered a luxury is now widely treated as essential infrastructure. As one planner put it, a city without trees is like a house without a roof: it may stand, but it will not protect the people inside.',
'Questions 9–14: প্যাসেজ পড়ে উত্তর দিন।', 2);

-- Passage 1 questions (TFNG 1-5, gap 6-8)
INSERT INTO questions (exam_id, section_id, qtype, text, option_a, option_b, option_c, option_d, correct_option, accepted_answers, explanation, sort_order) VALUES
(1, 1, 'tfng', 'A honeybee performs the same role throughout its entire life.', '', '', '', '', 1, '', 'প্যাসেজে বলা আছে প্রতিটি মৌমাছি জীবনের বিভিন্ন ধাপে ভিন্ন ভিন্ন কাজ করে — তাই FALSE।', 1),
(1, 1, 'tfng', 'The waggle dance shows both the direction and the distance of a food source.', '', '', '', '', 0, '', 'নাচের কোণ দিক নির্দেশ করে, আর waggle অংশের দৈর্ঘ্য দূরত্ব বোঝায় — TRUE।', 2),
(1, 1, 'tfng', 'Foragers watch the waggle dance with their eyes inside the hive.', '', '', '', '', 1, '', 'মৌচাকের অন্ধকারে তারা স্পর্শ ও কম্পনের মাধ্যমে তথ্য নেয় — FALSE।', 3),
(1, 1, 'tfng', 'Scout bees sometimes fight physically to decide on a new nest site.', '', '', '', '', 2, '', 'প্যাসেজে শারীরিক লড়াইয়ের কথা বলা হয়নি — NOT GIVEN।', 4),
(1, 1, 'tfng', 'All food crops grown by humans depend on insect pollination.', '', '', '', '', 1, '', 'প্রায় এক-তৃতীয়াংশ ফসল নির্ভরশীল, সব নয় — FALSE।', 5),
(1, 1, 'gap', 'When a colony grows too large, about half the bees leave together with the old ______.', '', '', '', '', 0, 'queen|the queen|old queen', 'প্যাসেজ অনুযায়ী পুরনো রানিসহ প্রায় অর্ধেক মৌমাছি নতুন বাসার খোঁজে বের হয়।', 6),
(1, 1, 'gap', 'Dances for better nest sites attract more ______ until agreement is reached.', '', '', '', '', 0, 'supporters|more supporters', 'ভালো জায়গার পক্ষের নাচ বেশি সমর্থক টানে — শব্দটি supporters।', 7),
(1, 1, 'gap', 'Certain farm chemicals can damage the bees'' ability to ______.', '', '', '', '', 0, 'navigate|navigation', 'প্যাসেজে বলা হয়েছে রাসায়নিক মৌমাছির পথ চেনার (navigate) ক্ষমতা নষ্ট করতে পারে।', 8);

-- Passage 2 questions (MCQ 9-11, TFNG 12-14)
INSERT INTO questions (exam_id, section_id, qtype, text, option_a, option_b, option_c, option_d, correct_option, accepted_answers, explanation, sort_order) VALUES
(1, 2, 'mcq', 'What is "transpiration" as described in the passage?', 'Trees trapping dust on their leaves', 'Trees releasing water vapour from leaves', 'Roots absorbing storm water', 'Branches providing shade', 1, '', 'Transpiration হলো পাতা থেকে জলীয় বাষ্প নির্গত হওয়া।', 9),
(1, 2, 'mcq', 'According to the passage, what do some critics say about tree-planting programmes?', 'They are too expensive to continue', 'They damage hospital buildings', 'They often favour richer areas', 'They increase flooding', 2, '', 'সমালোচকদের মতে বৃক্ষরোপণ কর্মসূচি প্রায়ই ধনী এলাকার দিকে ঝোঁকে।', 10),
(1, 2, 'mcq', 'The comparison of a city without trees to "a house without a roof" suggests that trees are—', 'decorative but optional', 'a form of essential protection', 'too costly to maintain', 'a replacement for buildings', 1, '', 'উপমাটির অর্থ: গাছ শহরের অপরিহার্য সুরক্ষা-অবকাঠামো।', 11),
(1, 2, 'tfng', 'Scientists fully agree that seeing greenery speeds up hospital recovery.', '', '', '', '', 1, '', 'বিজ্ঞানীরা এখনো এই প্রভাব নিয়ে বিতর্ক করছেন — FALSE।', 12),
(1, 2, 'tfng', 'Tree roots can cause damage to pavements.', '', '', '', '', 0, '', 'প্যাসেজে সরাসরি বলা আছে শিকড় ফুটপাত ফাটাতে পারে — TRUE।', 13),
(1, 2, 'tfng', 'Milan was the first city in the world to plant an urban forest.', '', '', '', '', 2, '', 'কোন শহর প্রথম ছিল তা প্যাসেজে বলা হয়নি — NOT GIVEN।', 14);

-- ============ EXAM 2: Academic Reading Mock 2 ============
INSERT INTO exams (title, description, category, module, duration_minutes, marks_per_question, negative_mark, is_live)
VALUES ('Academic Reading মক টেস্ট — ২', 'দ্বিতীয় রিডিং মক: এক প্যাসেজ, মিশ্র প্রশ্ন। সময় ধরে অনুশীলন করুন, সঙ্গে সঙ্গেই ব্যান্ড।', 'IELTS Reading', 'reading', 15, 1, 0, true);

INSERT INTO sections (exam_id, title, passage_title, passage_text, instruction, sort_order) VALUES
(2, 'Passage 1', 'A Short History of the Bicycle',
'The bicycle, now a symbol of clean transport, took a surprisingly long time to reach its familiar form. Early two-wheeled machines of the early nineteenth century had no pedals at all; riders pushed themselves along with their feet. Pedals attached directly to the front wheel appeared decades later, producing the famous "high-wheeler" with its enormous front wheel. These machines were fast but dangerous, since the rider sat high above the ground and could be thrown forward by the smallest obstacle.

The crucial breakthrough came in the 1880s with the so-called safety bicycle. It combined two wheels of equal size, a chain drive to the rear wheel, and shortly afterwards, air-filled rubber tyres. Suddenly cycling was no longer a risky sport for athletic young men but a practical means of travel for almost everyone. Historians note that the bicycle played a quiet role in social change: it gave working people an affordable way to travel beyond their own neighbourhoods and offered women in particular a new degree of independent mobility.

Bicycle design has continued to evolve — lighter frames, multiple gears, and electric assistance — yet the basic layout of the safety bicycle has remained essentially unchanged for more than a century. Few inventions have proved so durable. In an age of congested roads and climate concerns, many cities are rediscovering what riders in the 1890s already knew: the bicycle is one of the most efficient machines ever built.',
'Questions 1–8: প্যাসেজ পড়ে উত্তর দিন।', 1);

INSERT INTO questions (exam_id, section_id, qtype, text, option_a, option_b, option_c, option_d, correct_option, accepted_answers, explanation, sort_order) VALUES
(2, 3, 'mcq', 'How did riders move the earliest two-wheeled machines?', 'By turning pedals on the front wheel', 'By pushing with their feet', 'By using a chain drive', 'By electric assistance', 1, '', 'প্রথম দিকের মেশিনে প্যাডেল ছিল না; চালকেরা পা দিয়ে ঠেলে চলতেন।', 1),
(2, 3, 'mcq', 'Why were high-wheelers considered dangerous?', 'Their tyres often burst', 'Their chains frequently broke', 'Riders sat high and could be thrown forward', 'They were too heavy to stop', 2, '', 'চালক অনেক উঁচুতে বসতেন বলে সামান্য বাধায় সামনে ছিটকে পড়তে পারতেন।', 2),
(2, 3, 'tfng', 'The safety bicycle used two wheels of equal size.', '', '', '', '', 0, '', 'Safety bicycle-এর বৈশিষ্ট্যই ছিল সমান মাপের দুটি চাকা — TRUE।', 3),
(2, 3, 'tfng', 'Air-filled tyres were invented before the safety bicycle.', '', '', '', '', 1, '', 'প্যাসেজ বলছে টায়ার এসেছে safety bicycle-এর কিছু পরে — FALSE।', 4),
(2, 3, 'tfng', 'The bicycle increased independent travel opportunities for women.', '', '', '', '', 0, '', 'ঐতিহাসিকদের মতে সাইকেল নারীদের স্বাধীন চলাচলের নতুন সুযোগ দেয় — TRUE।', 5),
(2, 3, 'tfng', 'The author believes electric bicycles will replace all other types.', '', '', '', '', 2, '', 'এমন কোনো মত প্যাসেজে নেই — NOT GIVEN।', 6),
(2, 3, 'gap', 'The safety bicycle sent power to the rear wheel using a ______ drive.', '', '', '', '', 0, 'chain|chain drive', 'পেছনের চাকায় শক্তি পৌঁছাত চেইন ড্রাইভের মাধ্যমে।', 7),
(2, 3, 'gap', 'The basic layout of the safety bicycle has stayed almost unchanged for over a ______.', '', '', '', '', 0, 'century|a century|hundred years|100 years', 'একশো বছরের বেশি সময় ধরে মূল নকশা প্রায় একই আছে।', 8);

-- ============ EXAM 3: Writing Task mock ============
INSERT INTO exams (title, description, category, module, duration_minutes, marks_per_question, negative_mark, is_live)
VALUES ('Writing Task 2 মক টেস্ট', 'আসল পরীক্ষার মতো স্ক্রিন: বাঁয়ে টাস্ক, ডানে লেখার জায়গা, লাইভ শব্দগণনা। ইনস্ট্রাক্টর আপনার লেখা মূল্যায়ন করবেন।', 'IELTS Writing', 'writing', 40, 1, 0, true);

INSERT INTO sections (exam_id, title, passage_title, passage_text, instruction, sort_order) VALUES
(3, 'Task 2', 'Opinion Essay',
'Some people believe that students learn best when teachers strictly control the classroom. Others think students make more progress when they are given freedom to explore topics on their own.

Discuss both views and give your own opinion.

Give reasons for your answer and include any relevant examples from your own knowledge or experience.',
'কমপক্ষে ২৫০ শব্দ লিখুন। সময়: ৪০ মিনিট।', 1);

-- ============ EXAM 4: Grammar & Vocabulary MCQ ============
INSERT INTO exams (title, description, category, module, duration_minutes, marks_per_question, negative_mark, is_live)
VALUES ('English Grammar & Vocabulary Drill', 'Tense, preposition ও vocabulary-র দ্রুত MCQ ড্রিল — রিডিং-রাইটিংয়ের ভিত মজবুত করতে।', 'Grammar', 'mcq', 10, 1, 0.25, true);

INSERT INTO questions (exam_id, section_id, qtype, text, option_a, option_b, option_c, option_d, correct_option, accepted_answers, explanation, sort_order) VALUES
(4, NULL, 'mcq', 'She is good ___ mathematics.', 'in', 'at', 'on', 'with', 1, '', '"Good at" হলো সঠিক preposition collocation।', 1),
(4, NULL, 'mcq', 'I have been living here ___ 2015.', 'for', 'from', 'since', 'by', 2, '', 'নির্দিষ্ট সময়বিন্দুর সাথে "since" বসে।', 2),
(4, NULL, 'mcq', 'Choose the correct sentence:', 'He go to school.', 'He goes to school.', 'He going to school.', 'He gone to school.', 1, '', 'Third person singular-এ verb-এ s/es যোগ হয়।', 3),
(4, NULL, 'mcq', 'The antonym of "ancient" is:', 'old', 'antique', 'modern', 'aged', 2, '', '"Ancient" (প্রাচীন)-এর বিপরীত "modern"।', 4),
(4, NULL, 'mcq', '"Look after" means:', 'to search', 'to take care of', 'to follow', 'to watch', 1, '', '"Look after" অর্থ যত্ন নেওয়া।', 5),
(4, NULL, 'mcq', 'What is the plural of "child"?', 'childs', 'childes', 'children', 'childrens', 2, '', 'Irregular plural: child → children।', 6),
(4, NULL, 'mcq', 'By this time next year, she ___ her degree.', 'completes', 'will have completed', 'completed', 'is completing', 1, '', 'ভবিষ্যতের নির্দিষ্ট সময়ের আগে শেষ হবে বোঝাতে future perfect।', 7),
(4, NULL, 'mcq', 'Choose the synonym of "significant":', 'minor', 'important', 'doubtful', 'simple', 1, '', '"Significant" অর্থ গুরুত্বপূর্ণ — synonym "important"।', 8);

-- ============ EXAM 5: Vocabulary gap-fill ============
INSERT INTO exams (title, description, category, module, duration_minutes, marks_per_question, negative_mark, is_live)
VALUES ('Spelling & Word Form চ্যালেঞ্জ', 'টাইপ-করা উত্তরের অনুশীলন — আসল পরীক্ষার gap-fill প্রশ্নের মতো, বানানের গ্রহণযোগ্য বিকল্পসহ মার্কিং।', 'Vocabulary', 'mcq', 8, 1, 0, true);

INSERT INTO questions (exam_id, section_id, qtype, text, option_a, option_b, option_c, option_d, correct_option, accepted_answers, explanation, sort_order) VALUES
(5, NULL, 'gap', 'The noun form of "decide" is ______.', '', '', '', '', 0, 'decision', 'decide → decision।', 1),
(5, NULL, 'gap', 'Rain, snow and hail are all forms of ______ (বৃষ্টিপাতজাতীয় শব্দ, p দিয়ে শুরু).', '', '', '', '', 0, 'precipitation', 'আবহাওয়ার শব্দভান্ডারে বৃষ্টি-তুষার ইত্যাদি একসাথে precipitation।', 2),
(5, NULL, 'gap', 'The British spelling of "color" is ______.', '', '', '', '', 0, 'colour', 'British English-এ colour।', 3),
(5, NULL, 'gap', 'A person who travels to work every day is a ______.', '', '', '', '', 0, 'commuter', 'নিয়মিত যাতায়াতকারী = commuter।', 4),
(5, NULL, 'gap', 'The adjective form of "benefit" is ______.', '', '', '', '', 0, 'beneficial', 'benefit → beneficial।', 5),
(5, NULL, 'gap', 'The opposite of "increase" is ______.', '', '', '', '', 0, 'decrease|reduce|reduction', 'increase-এর বিপরীত decrease।', 6);

-- ============ Resources ============
INSERT INTO resources (title, description, category, type, url) VALUES
('Reading-এ স্কোর বাড়ানোর ১০টি কৌশল', 'Skimming, scanning আর সময় ভাগ করার বাস্তব কৌশল — ২০ মিনিটে এক প্যাসেজ শেষ করার রুটিনসহ।', 'Reading', 'article', '#'),
('Writing Task 2 স্ট্রাকচার গাইড (পিডিএফ)', 'Introduction-Body-Conclusion-এর প্রমাণিত কাঠামো, লিংকিং শব্দের তালিকা ও মডেল আনসারসহ।', 'Writing', 'pdf', '#'),
('True/False/Not Given ভুল এড়ানোর উপায়', 'FALSE আর NOT GIVEN-এর পার্থক্য কোথায় — সবচেয়ে বেশি নম্বর হারানো প্রশ্নের সমাধান।', 'Reading', 'video', '#'),
('Academic Word List অনুশীলন নোট', 'পরীক্ষায় সবচেয়ে বেশি আসা একাডেমিক শব্দগুলোর বাংলা অর্থ, word form ও ব্যবহারসহ।', 'Vocabulary', 'pdf', '#'),
('Band 7+ রাইটিংয়ের সাধারণ ভুলগুলো', 'গ্রামার ঠিক থাকার পরও কেন ব্যান্ড আটকে যায় — Task Response ও Coherence-এর ব্যাখ্যা।', 'Writing', 'article', '#'),
('Spelling যেভাবে নম্বর কাটে', 'টাইপ-করা উত্তরে কোন বানান গ্রহণযোগ্য, কোনটি নয় — British/American বিকল্পসহ।', 'Vocabulary', 'article', '#');

-- ============ Sample attempts ============
INSERT INTO attempts (exam_id, student_name, score, band_score, correct_count, wrong_count, skipped_count, total_questions, time_taken_seconds, answers, status) VALUES
(1, 'সাবিনা ইয়াসমিন', 13, 7.5, 13, 1, 0, 14, 1020, '{}', 'scored'),
(1, 'তানভীর হাসান', 11, 6.5, 11, 3, 0, 14, 1130, '{}', 'scored'),
(1, 'মেহজাবিন আক্তার', 9, 6, 9, 4, 1, 14, 1180, '{}', 'scored'),
(2, 'রাকিব হোসেন', 7, 7, 7, 1, 0, 8, 780, '{}', 'scored'),
(2, 'নুসরাত জাহান', 6, 6.5, 6, 2, 0, 8, 820, '{}', 'scored'),
(4, 'আরিফুল ইসলাম', 6.75, NULL, 7, 1, 0, 8, 420, '{}', 'scored'),
(5, 'ফারজানা মিম', 5, NULL, 5, 1, 0, 6, 300, '{}', 'scored');

COMMIT;

-- 20 additional original full-length IELTS-format tests (40 questions each)
\ir ielts-library.sql
