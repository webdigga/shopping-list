PRAGMA defer_foreign_keys=TRUE;
CREATE TABLE items (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    completed INTEGER DEFAULT 0,
    position INTEGER DEFAULT 0,
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now'))
);
INSERT INTO "items" ("id","name","completed","position","created_at","updated_at") VALUES('458e9f5e-1779-2d2a-cefd-07fd3b308fcc','Metal scourers',1,2,'2026-02-06 12:36:59','2026-10-16T05:25:03.571Z');
INSERT INTO "items" ("id","name","completed","position","created_at","updated_at") VALUES('fc15e9bb-38f4-45f5-ae5d-8d2a59c241b5','Body wash',1,3,'2026-02-06 12:36:59','2026-10-16T05:25:06.595Z');
INSERT INTO "items" ("id","name","completed","position","created_at","updated_at") VALUES('27241674-8cce-3f31-d8ba-0dbf671648d2','Conditioner',1,6,'2026-02-06 12:36:59','2026-10-16T05:25:28.442Z');
INSERT INTO "items" ("id","name","completed","position","created_at","updated_at") VALUES('9045963f-7e49-f7a6-043f-1292099c6661','Colour catcher',1,7,'2026-02-06 12:36:59','2026-10-16T05:25:29.700Z');
INSERT INTO "items" ("id","name","completed","position","created_at","updated_at") VALUES('d012863f-62e2-98c4-b68f-34a1394b4e9b','Frozen berries',1,8,'2026-02-06 12:36:59','2026-10-16T06:36:03.722Z');
INSERT INTO "items" ("id","name","completed","position","created_at","updated_at") VALUES('d16622fe-97b7-8078-1ec8-719e5c37e5e2','Apple cider vinegar',1,9,'2026-02-06 12:36:59','2026-10-16T05:25:44.668Z');
INSERT INTO "items" ("id","name","completed","position","created_at","updated_at") VALUES('ba36eaa0-1036-bc66-d334-7146341903ee','Clothes washing liquid',1,10,'2026-02-06 12:36:59','2026-10-16T05:25:46.403Z');
INSERT INTO "items" ("id","name","completed","position","created_at","updated_at") VALUES('3d302cf1-a7e1-5229-d0ca-84f11795e802','Butter',1,11,'2026-02-06 12:36:59','2026-10-16T05:26:26.562Z');
INSERT INTO "items" ("id","name","completed","position","created_at","updated_at") VALUES('e832f645-1b66-d5ea-ada5-c6249ea5aaba','Chia seeds',1,12,'2026-02-06 12:36:59','2026-10-16T05:26:30.572Z');
INSERT INTO "items" ("id","name","completed","position","created_at","updated_at") VALUES('7a509d2a-eb14-152b-39cf-72e6f3502d53','Shampoo',1,13,'2026-02-06 12:36:59','2026-10-16T05:26:31.758Z');
INSERT INTO "items" ("id","name","completed","position","created_at","updated_at") VALUES('f3196f01-7871-fc60-cdea-12941eac0a68','Nuts',1,14,'2026-02-06 12:36:59','2026-10-16T06:28:57.903Z');
INSERT INTO "items" ("id","name","completed","position","created_at","updated_at") VALUES('9d39ab67-d339-5a51-4b9e-36ace4cc2a08','Washing machine cleaner',1,15,'2026-02-06 12:36:59','2026-10-16T05:26:35.819Z');
INSERT INTO "items" ("id","name","completed","position","created_at","updated_at") VALUES('818bd38b-1003-5c5d-746f-1cf10241fdfb','Poo bags',1,18,'2026-02-06 12:36:59','2026-10-16T05:26:37.806Z');
INSERT INTO "items" ("id","name","completed","position","created_at","updated_at") VALUES('edfcd6d6-e732-1ca8-dc79-47e1f0f45d99','Kitchen towel',1,20,'2026-02-06 12:36:59','2026-10-16T05:26:39.050Z');
INSERT INTO "items" ("id","name","completed","position","created_at","updated_at") VALUES('08f72f0f-8c63-a315-0357-c9c493cb005a','Toilet cleaner',1,21,'2026-02-06 12:36:59','2026-10-16T05:26:40.085Z');
INSERT INTO "items" ("id","name","completed","position","created_at","updated_at") VALUES('06a56d8a-2727-ab9f-1810-ea3347d5224f','White wine vinegar',1,23,'2026-02-06 12:36:59','2026-10-16T05:26:44.551Z');
INSERT INTO "items" ("id","name","completed","position","created_at","updated_at") VALUES('6bc51ae0-62c0-7bf5-8afc-9d564c015b34','Seeds',1,24,'2026-02-06 12:36:59','2026-10-16T05:26:51.894Z');
INSERT INTO "items" ("id","name","completed","position","created_at","updated_at") VALUES('708f4f3a-c029-7217-5884-24cfb9d86f51','Eggs',1,25,'2026-02-06 12:36:59','2026-10-16T06:35:04.113Z');
INSERT INTO "items" ("id","name","completed","position","created_at","updated_at") VALUES('89df56cb-be8b-e619-1ed3-ed59a2c6ae31','Cheese',1,26,'2026-02-06 12:36:59','2026-10-16T06:31:37.502Z');
INSERT INTO "items" ("id","name","completed","position","created_at","updated_at") VALUES('a53b4005-e59a-b8c0-4adb-2eefce64b400','Olive oil',1,28,'2026-02-06 12:36:59','2026-10-16T05:27:53.053Z');
INSERT INTO "items" ("id","name","completed","position","created_at","updated_at") VALUES('6f0b2241-26d9-36e3-0705-0bbd2a7e348b','Frozen Salmon',1,32,'2026-02-06 12:36:59','2026-10-16T06:36:04.605Z');
INSERT INTO "items" ("id","name","completed","position","created_at","updated_at") VALUES('88985664-8e3c-332d-76cf-685e44866ec3','Salt',1,34,'2026-02-06 12:36:59','2026-10-16T05:28:05.159Z');
INSERT INTO "items" ("id","name","completed","position","created_at","updated_at") VALUES('afed1346-a501-9005-aefa-eeb4fde22568','Cloths',1,38,'2026-02-06 12:36:59','2026-10-16T05:28:06.254Z');
INSERT INTO "items" ("id","name","completed","position","created_at","updated_at") VALUES('781a6588-32a5-fa1e-4d19-8bc10b17bd50','Sensitive toothpaste',1,39,'2026-02-06 12:36:59','2026-10-16T05:28:08.369Z');
INSERT INTO "items" ("id","name","completed","position","created_at","updated_at") VALUES('3872ed11-eaa2-72bf-ec45-2883b168d521','Toilet roll',1,41,'2026-02-06 12:36:59','2026-10-16T06:36:08.401Z');
INSERT INTO "items" ("id","name","completed","position","created_at","updated_at") VALUES('f79349ac-f661-8ffc-1755-0c0a80471865','Fairy liquid',1,45,'2026-02-06 12:36:59','2026-10-16T05:28:12.130Z');
INSERT INTO "items" ("id","name","completed","position","created_at","updated_at") VALUES('086ed684-243f-1857-fc74-8026f1b23c13','Antibacterial spray',1,47,'2026-02-06 12:36:59','2026-10-16T05:28:15.237Z');
INSERT INTO "items" ("id","name","completed","position","created_at","updated_at") VALUES('f7403ce3-4043-98db-6709-0645d43b15e3','Tin foil',1,48,'2026-02-06 12:36:59','2026-10-16T05:28:16.262Z');
INSERT INTO "items" ("id","name","completed","position","created_at","updated_at") VALUES('68927b3b-d022-8e23-68ad-50e99d382df7','Coffee',1,50,'2026-02-06 12:36:59','2026-10-16T05:28:17.954Z');
INSERT INTO "items" ("id","name","completed","position","created_at","updated_at") VALUES('5cfc8172-c8c3-a3ef-fd30-332a6efc0748','Bin bags',1,52,'2026-02-06 12:36:59','2026-10-16T05:28:23.610Z');
INSERT INTO "items" ("id","name","completed","position","created_at","updated_at") VALUES('5b110b1a-6e6d-9be1-7cfe-83530bd8aa18','Deodrant',1,53,'2026-02-06 12:36:59','2026-10-16T05:28:25.295Z');
INSERT INTO "items" ("id","name","completed","position","created_at","updated_at") VALUES('e9666d00-867b-cb5c-532b-632fa8d188ed','Steak x 2',1,54,'2026-02-06 12:36:59','2026-10-16T06:33:59.075Z');
INSERT INTO "items" ("id","name","completed","position","created_at","updated_at") VALUES('06d58c40-2370-435a-86c5-e46f4f52fafe','Soap',1,0,'2026-03-22T07:35:11.419Z','2026-10-16T05:24:37.761Z');
INSERT INTO "items" ("id","name","completed","position","created_at","updated_at") VALUES('3b616178-64a8-4b71-b379-3efd017e82b0','Brazil nuts',1,1,'2026-03-22T07:35:21.933Z','2026-10-16T06:29:27.638Z');
INSERT INTO "items" ("id","name","completed","position","created_at","updated_at") VALUES('b3774af9-2d7c-4bba-a3f2-dbb56f854512','High fat greek yoghurt',1,57,'2026-04-02T16:45:45.824Z','2026-10-16T06:32:29.764Z');
INSERT INTO "items" ("id","name","completed","position","created_at","updated_at") VALUES('ef9dceff-7e9c-4537-850c-b5d317ce1ac3','Toothpicks',1,0,'2026-05-21T11:54:45.324Z','2026-10-16T05:24:51.369Z');
INSERT INTO "items" ("id","name","completed","position","created_at","updated_at") VALUES('4b590356-f3db-4fb8-b919-c5d88c294919','Limes',1,59,'2026-07-17T06:04:33.667Z','2026-10-16T06:28:10.641Z');
INSERT INTO "items" ("id","name","completed","position","created_at","updated_at") VALUES('9a2aae8b-9ae8-4722-9f72-3a30c0862d4f','Mixed leaves',1,60,'2026-07-22T11:00:57.087Z','2026-10-16T06:57:18.606Z');
INSERT INTO "items" ("id","name","completed","position","created_at","updated_at") VALUES('d9e74d8f-edef-4397-841a-c139a912b9ed','Kimchi/Sauerkraut',1,0,'2026-07-29T16:47:04.832Z','2026-10-16T06:58:12.499Z');
INSERT INTO "items" ("id","name","completed","position","created_at","updated_at") VALUES('dba8a1de-a6d5-45ec-be9f-0415aa382f74','Steel cut oats',1,0,'2026-09-29T06:41:13.521Z','2026-10-16T05:24:50.137Z');
INSERT INTO "items" ("id","name","completed","position","created_at","updated_at") VALUES('f44bd675-d9fd-45a2-8555-d5eea452b5a2','Manilife peanut butter',0,63,'2026-10-02T06:12:41.317Z','2026-10-16T05:24:33.671Z');
INSERT INTO "items" ("id","name","completed","position","created_at","updated_at") VALUES('6edf95d8-4449-44dd-a17f-73b6ade761dd','Chicken thighs 1kg',1,64,'2026-10-02T06:17:15.261Z','2026-10-16T06:33:41.273Z');
INSERT INTO "items" ("id","name","completed","position","created_at","updated_at") VALUES('5a63ae0d-4697-43a7-b6a2-5880bc9e2d0e','Banana',1,65,'2026-10-02T06:17:57.058Z','2026-10-16T06:28:47.036Z');
INSERT INTO "items" ("id","name","completed","position","created_at","updated_at") VALUES('4eae149a-3f63-4187-a18a-da36e249e9cd','Pasta',1,66,'2026-10-02T07:18:04.741Z','2026-10-16T06:34:21.946Z');
INSERT INTO "items" ("id","name","completed","position","created_at","updated_at") VALUES('6fcebdfb-1c5d-4954-b585-f0148ad7b88a','Dark chocolate',0,67,'2026-10-09T04:50:11.510Z','2026-10-16T05:24:34.456Z');
CREATE TABLE settings (
    key TEXT PRIMARY KEY,
    value TEXT NOT NULL
);
CREATE TABLE sessions (
      token TEXT PRIMARY KEY,
      expires_at TEXT NOT NULL
  );
CREATE INDEX idx_items_completed ON items(completed);
CREATE INDEX idx_items_position ON items(position);
