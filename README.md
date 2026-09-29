# Affiliate Intelligence Studio

เว็บ HTML สำหรับจัดการงาน Shopee Affiliate ตั้งแต่รวบรวมหลักฐานสินค้า สร้างโครงบท วางแผนผลิตเนื้อหา ไปจนถึงติดตามผล TikTok / Facebook

## เปิดใช้งาน

1. ดาวน์โหลด repository หรือไฟล์ `index.html`
2. เปิด `index.html` ด้วย Chrome หรือ Edge
3. กด **ลองตัวอย่าง / Try demo** เพื่อดูข้อมูลสมมติที่แยกจากพื้นที่ข้อมูลจริง
4. เปลี่ยนภาษา UI ได้ด้วยปุ่ม **TH / EN**

ไม่ต้องติดตั้ง dependencies หรือสั่ง build ตัวแอปและฟอนต์ฝังอยู่ใน HTML ไฟล์เดียว

## ความสามารถ

- UI ไทย–อังกฤษ รองรับคอมและมือถือ
- บันทึกลิงก์ Affiliate เดิม รุ่น ราคา รูป และหลักฐานที่ผู้ใช้ให้
- คะแนนแบบมีกฎคงที่ แยก Opportunity score กับ Evidence coverage; ซ่อนคะแนนรวมเมื่อ coverage ต่ำกว่า 60%
- เปรียบเทียบสินค้า 2–5 รายการ พร้อมเหตุผลและ snapshot หลักฐาน
- Story Studio: 6 มุมเรื่อง โครงบท 15/30/60 วินาที Hook A/B ฉาก Caption และโพสต์ Facebook
- แก้บท เก็บเวอร์ชัน และตรวจรายการก่อนกำหนดสถานะ Ready
- แผน 7/14/30 วัน ตามกำลังผลิต เหลือเวลาสำรองอย่างน้อย 20% และมีลำดับงานก่อน–หลัง
- บันทึกโพสต์และผลแบบ cumulative snapshot ที่อายุ 24h / 72h / 7d
- เปรียบเทียบการทดลองเชิงสังเกต และคำนวณสถานการณ์สมมติจากค่าที่กรอก
- สำรอง/นำเข้า JSON พร้อมตรวจข้อมูล และส่งออกผล CSV

## ข้อจำกัดของ HTML edition

- **ยังไม่ได้เชื่อม Shopee resolver, AI หรือการค้นออนไลน์**
- การวิเคราะห์ใช้คะแนนและหลักฐานที่ผู้ใช้กรอก การสร้างบทใช้แม่แบบในเครื่อง
- ไม่ดึงชื่อ ราคา รูป หรือคอมมิชชันจากลิงก์ให้อัตโนมัติ
- ต้องตรวจข้ออ้าง แหล่งข้อมูล รุ่น ราคา และเงื่อนไขก่อนใช้บทจริง
- ไม่โพสต์ไป TikTok/Facebook อัตโนมัติ และไม่รับประกันยอดขายหรือความแม่นยำเชิงพยากรณ์
- การเชื่อมออนไลน์ในอนาคตต้องมี backend สำหรับตรวจ URL และเก็บ API key; ห้ามฝัง secret ใน HTML

## ข้อมูลและการสำรอง

ข้อมูลที่บันทึกอยู่ใน IndexedDB ของเบราว์เซอร์ ไม่ถูกอัปโหลดเข้า repository นี้หรือซิงก์ข้ามเครื่องโดยแอป
ควรส่งออก JSON เป็นระยะ โดยเฉพาะก่อนล้างข้อมูลเบราว์เซอร์ ย้ายไฟล์ หรือย้ายเครื่อง
การเปิดผ่าน file URL และการเปิดผ่านเว็บไซต์มีพื้นที่จัดเก็บคนละ origin; ใช้ JSON ย้ายข้อมูลระหว่างกัน

รูปจาก URL ภายนอกจะถูกโหลดจากผู้ให้บริการรูปนั้น หากต้องการใช้งานโดยไม่พึ่งเครือข่าย ให้อัปโหลดรูปจากเครื่องแทน

เขตเวลา: Asia/Bangkok · สกุลเงิน: THB

## การตรวจสอบ

ทดสอบใน Chromium: ขั้นตอนเพิ่มสินค้าและบท, การคงบทเมื่อเปลี่ยนภาษา, persistence, JSON validation,
การแยก demo, คะแนนและค่าว่าง, cumulative snapshot deduplication, capacity/dependencies,
การป้องกันข้อมูลนำเข้าอันตราย และความกว้างหน้าจอมือถือทั้ง 8 หน้า

## ฟอนต์

ฝัง Noto Sans Thai ภายใต้ SIL Open Font License 1.1 โดยเก็บข้อความ license ไว้ใน `index.html`

---

### English

A self-contained, bilingual local workspace for evidence-based affiliate planning and tracking.
Download and open `index.html` in Chrome or Edge. No build step is required.
The app uses manual evidence and local story templates; Shopee retrieval, online AI, and online research are **not connected**.
Records stay in your browser. Export JSON backups regularly.
