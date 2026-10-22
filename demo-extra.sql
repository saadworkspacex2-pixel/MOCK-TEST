-- Extra original demo content (run after schema.sql + seed.sql + demo media insert)
BEGIN;
CREATE SCHEMA IF NOT EXISTS lhbd_app;
SET LOCAL search_path TO lhbd_app;

INSERT INTO exams (title, description, category, module, duration_minutes, marks_per_question, negative_mark, is_live)
SELECT 'Listening ডেমো টেস্ট — Section 1', 'অডিও প্লেয়ারসহ লিসেনিং স্ক্রিনের ডেমো। ট্রান্সক্রিপ্ট পড়ে বা অডিও শুনে উত্তর দিন, জমা দিলেই ব্যান্ড স্কোর।', 'IELTS Listening', 'listening', 10, 1, 0, true
WHERE NOT EXISTS (SELECT 1 FROM exams WHERE module='listening');

INSERT INTO sections (exam_id, title, passage_title, passage_text, instruction, audio_url, sort_order)
SELECT id, 'Section 1', 'Community Library Membership',
'TRANSCRIPT (demo):

Receptionist: Good morning, Greenfield Community Library. How can I help you?
Caller: Hi, I would like to join the library. Could you tell me what I need?
Receptionist: Of course. Membership is free for residents. You just need one photo ID and a recent utility bill as proof of address.
Caller: Great. How many books can I borrow at a time?
Receptionist: Standard members can borrow six books for three weeks. Students can borrow eight.
Caller: And is the library open on Sundays?
Receptionist: We open from ten in the morning to four in the afternoon on Sundays. On weekdays we close at eight in the evening.
Caller: One more thing, is there a fee for reserving a book?
Receptionist: Reservations are free online, but there is a fifty-taka charge if our staff place the reservation for you at the desk.',
'Questions 1-6: অডিও শুনে (বা ডেমোর জন্য ট্রান্সক্রিপ্ট পড়ে) উত্তর দিন।',
(SELECT '/api/media/' || id::text FROM media ORDER BY id LIMIT 1), 1
FROM exams WHERE module='listening'
AND NOT EXISTS (SELECT 1 FROM sections WHERE passage_title='Community Library Membership');

INSERT INTO questions (exam_id, section_id, qtype, text, option_a, option_b, option_c, option_d, correct_option, accepted_answers, explanation, sort_order)
SELECT e.id, s.id, q.qtype, q.text, q.a, q.b, q.c, q.d, q.correct, q.accepted, q.expl, q.ord
FROM (SELECT id FROM exams WHERE module='listening' ORDER BY id DESC LIMIT 1) e
CROSS JOIN (SELECT id FROM sections WHERE passage_title='Community Library Membership' LIMIT 1) s
CROSS JOIN (VALUES
  ('mcq', 'How much does library membership cost for residents?', 'Fifty taka', 'Nothing, it is free', 'It depends on age', 'The audio does not say', 1, '', 'রিসেপশনিস্ট বলেন residents-দের জন্য মেম্বারশিপ ফ্রি।', 1),
  ('gap', 'To join, you need one photo ID and a recent ______ bill.', '', '', '', '', 0, 'utility|a utility', 'Proof of address হিসেবে utility bill লাগবে।', 2),
  ('gap', 'Standard members can borrow ______ books at a time.', '', '', '', '', 0, 'six|6', 'Standard member-রা একসাথে ছয়টি বই নিতে পারেন।', 3),
  ('mcq', 'How long is the standard borrowing period?', 'One week', 'Two weeks', 'Three weeks', 'One month', 2, '', 'তিন সপ্তাহের জন্য বই নেওয়া যায়।', 4),
  ('mcq', 'On Sundays the library closes at:', '2 pm', '4 pm', '6 pm', '8 pm', 1, '', 'রবিবারে সকাল ১০টা থেকে বিকেল ৪টা পর্যন্ত খোলা।', 5),
  ('gap', 'Placing a reservation at the desk costs ______ taka.', '', '', '', '', 0, 'fifty|50', 'ডেস্কে স্টাফ রিজার্ভ করলে পঞ্চাশ টাকা চার্জ।', 6)
) AS q(qtype, text, a, b, c, d, correct, accepted, expl, ord)
WHERE NOT EXISTS (SELECT 1 FROM questions WHERE exam_id=e.id);

INSERT INTO settings (key, value) VALUES
('site_name','LHBD'),
('seo_title','LHBD | মক টেস্ট অনলাইন, আসল স্ক্রিন, সঙ্গে সঙ্গে স্কোর'),
('seo_description','কম্পিউটার-ডেলিভার্ড পরীক্ষার মতো স্ক্রিনে Reading, Listening, Writing ও Grammar মক টেস্ট। জমা দেওয়ার সঙ্গে সঙ্গেই ব্যান্ড স্কোর, ব্যাখ্যাসহ উত্তর ও লিডারবোর্ড, সব ফ্রি।'),
('seo_keywords','মক টেস্ট, mock test, reading test, listening test, writing task, band score, অনলাইন পরীক্ষা')
ON CONFLICT (key) DO NOTHING;

COMMIT;
