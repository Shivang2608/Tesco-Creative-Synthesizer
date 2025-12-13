<img width="1919" height="962" alt="Screenshot 2025-12-13 000312" src="https://github.com/user-attachments/assets/96cf3b97-f7d9-40f5-85ea-7816469307cc" />
<img width="1379" height="644" alt="Screenshot 2025-12-13 000425" src="https://github.com/user-attachments/assets/34cafd27-a28c-4c26-a3ef-b521720f4f45" />
<img width="1369" height="720" alt="Screenshot 2025-12-13 000448" src="https://github.com/user-attachments/assets/848dd6f2-5a36-4cd3-9d5f-6f3029ded8ec" />
<img width="1367" height="734" alt="Screenshot 2025-12-13 000505" src="https://github.com/user-attachments/assets/be559b8f-4e8d-4311-8dc6-58ae852ec33b" />
<img width="1363" height="724" alt="Screenshot 2025-12-13 000519" src="https://github.com/user-attachments/assets/c249f01f-01bf-4caf-a8d4-47afae9e0397" />
<img width="1391" height="649" alt="Screenshot 2025-12-13 000547" src="https://github.com/user-attachments/assets/a50f994a-c351-4add-8cad-ff9f4a898257" />
<img width="1387" height="657" alt="Screenshot 2025-12-13 000633" src="https://github.com/user-attachments/assets/b422edbd-5dae-438a-b1d1-3185405a134c" />
<img width="1372" height="643" alt="Screenshot 2025-12-13 000609" src="https://github.com/user-attachments/assets/22a89cdd-bcc9-420b-83c3-71aedbb900e9" />


# 🛒 Tesco Creative Synthesizer (TCS) 🎨

## **A Full-Stack Generative AI Application for E-Commerce Marketing**



| Status | Live Demo | Repository |
| :--- | :--- | :--- |
| **Complete (Hackathon)** | [tesco-creative-synthesizer.vercel.app/](https://tesco-creative-synthesizer.vercel.app/) | [Shivang2608/Tesco-Creative-Synthesizer](https://github.com/Shivang2608/Tesco-Creative-Synthesizer) |

---

## 🎯 Project Overview & Problem Solved

The Tesco Creative Synthesizer (TCS) addresses a critical challenge in modern retail and e-commerce marketing: **scalability and compliance of creative assets.** Traditional marketing requires expensive photoshoots and manual editing.

TCS automates the creation of high-quality, brand-safe marketing images by integrating several cutting-edge AI models, allowing Tesco to generate compliant product images across diverse social media and digital platforms instantly.

### Key Innovations:

1.  **Compliance Engine:** Prevents the generation of images that violate brand guidelines (e.g., generating images of competitors or politically sensitive content) using the **Gemini 2.5 Flash** content analysis API.
2.  **Full Automation:** Takes a simple product image and places it into a generated, realistic marketing background.

---

## ⚙️ Technical Architecture & Stack

This project is built as a decoupled, full-stack microservice architecture, demonstrating strong expertise in both modern frontend development and high-performance MLOps deployment.

### Frontend (Next.js 14)

* **Framework:** **Next.js 14** (App Router) with **TypeScript**.
* **Styling:** **Tailwind CSS** for rapid, utility-first UI development.
* **State Management:** Standard React Hooks for managing complex asynchronous API calls and image state.

### Backend & AI Microservices (FastAPI)

The backend is deployed separately on a scalable cloud infrastructure (Hugging Face Spaces/Docker), demonstrating expertise in handling heavy-compute tasks.

| Service | Technology | Role |
| :--- | :--- | :--- |
| **Image Generation** | **Stable Diffusion XL (SDXL)** | Generates photorealistic backgrounds based on user prompts. |
| **Content Compliance**| **Google Gemini 2.5 Flash API** | Analyzes user prompts and generated images for brand-safety and compliance (e.g., checking for competitor logos). |
| **Background Removal**| **U2Net** (Computer Vision Model) | Highly accurate segmentation model used to cleanly separate the product from its original background. |
| **API Framework** | **FastAPI** | High-performance Python backend for serving the compute-intensive AI models. |
| **Containerization** | **Docker** | Used to package and deploy the Python FastAPI services consistently. |

---

## 🚀 Deployment & Scalability

| Component | Deployment Platform | Notes |
| :--- | :--- | :--- |
| **Frontend** | **Vercel** | Utilizing Vercel's Edge functions for serverless rendering and high availability. |
| **Backend/API** | **Hugging Face Spaces** | The FastAPI service is deployed here, optimizing for GPU/CPU acceleration required by the generative models. |

## 💡 How to Run Locally

### 1. Prerequisites

* Node.js (v18+) & npm
* Python (v3.9+) & pip
* A Google Gemini API Key
* A Stability AI API Key (or a locally deployed SDXL model)

### 2. Setup (Frontend)

```bash
# Clone the repository
git clone [https://github.com/Shivang2608/Tesco-Creative-Synthesizer.git](https://github.com/Shivang2608/Tesco-Creative-Synthesizer.git)
cd Tesco-Creative-Synthesizer/frontend

# Install dependencies
npm install

# Run the frontend (will start on http://localhost:3000)
npm run dev
3. Setup (Backend - FastAPI)
Follow the setup instructions in the /backend directory to run the API locally. You will need to configure your environment variables with your Gemini and Stable Diffusion keys to enable the services.

👤 Author
Shivang Sagar

This project was developed for a hackathon and is for demonstration purposes only. It is not affiliated with or endorsed by Tesco PLC.
