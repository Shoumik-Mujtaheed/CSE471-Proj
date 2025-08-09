Tech Stack: MERN

● Language: JavaScript 
● Framework: Express.js, Node.js 
● Styling: CSS
● Database: MongoDB
● ORM: Prisma
● Deployment: Vercel



Functional requirements:

Patient Facing Features 
Patient Registration: The system must allow for the quick and accurate registration of new patients, capturing personal details, contact information, and medical history. Each patient should be assigned a unique ID for use throughout the system.
Appointment Scheduling: Implement a module for patients to book, reschedule, or cancel appointments with doctors. The system should also send automated reminders to both patients and healthcare providers. 2,3 
Electronic Medical Records (EMR) Access: Develop a system for maintaining detailed EMRs for each patient, including diagnoses, treatment plans. Patients will be able to upload their existing medical history to their profile which will show on their EMR. And the doctors or hospital staff will upload the patients’ medicine prescription and test results that they receive from our hospital. 1 8
Patient Portal: Create a secure online portal where patients can view their health records, access lab results, see their appointment history, upload their existing medical records and communicate with their healthcare providers. 6 and 10

Doctors and Staff Management 
Doctor/Staff Management: The system should allow administrators to manage staff records, including personal information, qualifications, and roles. This includes adding new doctors and staff to the system. 4

Doctor & staff Scheduling: Create a feature for managing staff schedules including doctor, shifts, and leave requests to ensure optimal staffing levels and avoid conflicts. 

Doctors writing prescriptions: The doctors will be able to write prescriptions for the patients and the system will track the patients’ medications. 5,10 ,9

Doctor Referral and Lab Test Module:
Enable doctors to seamlessly refer patients to other specialists within the system. During the referral, the doctor can also order necessary laboratory or imaging tests (e.g., blood work, X-rays, etc.) relevant to the case. The referred doctor will have access to the patient's profile, test orders, and results which will ensure smooth handovers and faster diagnosis and treatment planning.Additionally, the patient's lab test results will be automatically uploaded to their Electronic Medical Record (EMR) falls under a lot

Administrative and Financial Operations

Add users/doctors/staff in bulk as CSV files and create 
Billing and Invoicing: Implement a robust financial module to handle patient billing, generate invoices for services, and process payments.

Inventory Management: Create a system to track and manage the inventory of pharmaceuticals, medical supplies, and equipment. It should support order management and usage tracking to prevent stockouts. 7

Reporting and Analytics: The system must be able to generate custom reports on various aspects of hospital operations, such as patient demographics, staff performance, to support data-driven decision-making.





Module 1: Core system setup:

[Mohsina] Complete the Patient Registration feature, allowing new patients to be added to the system database.
[Faiyaz] Showcase the Staff Management feature, where administrators can add and manage doctor and staff profiles. 
[Shoumik] Demonstrate the initial Billing and Invoicing system, capable of generating a basic invoice for a registered patient.
[Shoumik] Create the bulk upload system.

Module 2: Interactive and Management Features
[Mohsina] Present the Appointment Scheduling system, allowing a registered patient to book an appointment with a registered doctor.
[Mohsina] Present the Electronic Medical Records (EMR) Access feature, linking records to patient profiles.
[Faiyaz] Demonstrate the Staff Scheduling module, where shifts can be assigned to the staff created in the previous module.
[Shoumik] Create the hospital inventory system. Show the hospital’s pharmacy medicine inventory with adding and tracking medicines.

Module 3: Advanced Functionality and Integration

[Mohsina] [Mohsina] Demonstrate the working Patient Portal, where a patient can log in to view their information.
[Faiyaz] Showcase the Prescription Management module, allowing a doctor to create a prescription for a patient.
[Faiyaz] Demonstrate the Doctor Referral and Lab Test Module, where test results can be uploaded and attached to a patient's EMR and also doctors can refer a patient to another specialist and order tests for patients.
[Shoumik] Present the Reporting and Analytics feature by generating reports based on the data from the previous modules.
