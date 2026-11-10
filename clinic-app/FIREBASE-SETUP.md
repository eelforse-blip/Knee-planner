# ربط قاعدة بيانات العيادة (Firebase – مجاني)

عشان الطبيب والسكرتارية يشتغلوا على نفس البيانات من أكتر من جهاز:

1. ادخل https://console.firebase.google.com ← **Add project** ← اسم المشروع (مثلاً `elforse-clinic`) ← اقفل Google Analytics ← Create.
2. **Build ← Authentication ← Get started ← Email/Password ← Enable ← Save.**
3. **Build ← Firestore Database ← Create database** ← المكان `europe-west1` ← **Production mode** ← Create.
4. **Firestore ← Rules**: امسح الموجود والصق محتوى ملف `firestore.rules` ← **Publish**.
5. **Project settings (الترس) ← Your apps ← Web `</>`** ← اسم `Clinic` ← Register ← انسخ `firebaseConfig = { … }`.
6. في التطبيق: **المزيد ← ربط قاعدة بيانات العيادة** والصق الإعدادات (أو ابعتها لـ Claude يحطها جوه التطبيق).
7. اعمل حساب بإيميلك ← افتح رسالة التأكيد ← متابعة ← **إنشاء العيادة**.
8. ضيف السكرتارية من **المزيد ← الفريق**، وابعتلهم **كود إعداد العيادة** يلصقوه في أول شاشة ويعملوا حساب بنفس الإيميل.

مفتاح الويب مش سر؛ الحماية من قواعد الأمان ومن حساب كل شخص.
