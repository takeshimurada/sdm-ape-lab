<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# 서대문 유인원 연구회 | SDM APE LAB

인터랙티브 3D 얼굴 모델과 AI 번역을 결합한 실험적 웹 포트폴리오입니다.

View your app in AI Studio: https://ai.studio/apps/drive/1GyWkrLP-wGkY-J40FknaHnMRwUj6744J

## ✨ Features

- 🎨 **Interactive 3D Model**: Three.js와 React Three Fiber를 사용한 3D 얼굴 모델
- 🖱️ **Custom Cursor**: 하트 모양의 커스텀 커서와 글로우 효과
- 🤖 **AI Translation**: Gemini API를 활용한 다국어 번역
- 🎭 **Scrambled Text Effect**: 바이너리에서 실제 텍스트로 변환되는 애니메이션
- 💧 **Interactive Effects**: 코 호버 시 초록색 액체 드립 효과
- 📱 **Responsive Design**: 모든 디바이스에서 작동하는 반응형 디자인

## 🚀 Run Locally

**Prerequisites:** Node.js (v18 이상 권장)

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Set up environment variables:**
   - `.env.local.example` 파일을 `.env.local`로 복사
   ```bash
   cp .env.local.example .env.local
   ```
   - `.env.local` 파일을 열고 Gemini API 키 입력
   - API 키는 [Google AI Studio](https://aistudio.google.com/app/apikey)에서 발급받을 수 있습니다

3. **Run the development server:**
   ```bash
   npm run dev
   ```

4. **Open your browser:**
   - 브라우저에서 `http://localhost:3000` 접속

## 🏗️ Build for Production

```bash
npm run build
npm run preview
```

## 📦 Tech Stack

- **Frontend Framework**: React 19.2.3
- **Build Tool**: Vite 6.2.0
- **3D Graphics**: Three.js 0.182.0, React Three Fiber 9.5.0
- **Animation**: Framer Motion 12.25.0
- **AI Integration**: Google Gemini API 1.35.0
- **Styling**: Tailwind CSS
- **Language**: TypeScript 5.8.2

## 📂 Project Structure

```
sdm-ape-lab/
├── components/           # React 컴포넌트들
│   ├── Navbar.tsx       # 네비게이션 바
│   ├── AboutPage.tsx    # About 페이지
│   ├── ArchiveGrid.tsx  # Archive 그리드
│   └── CustomModelLoader.tsx  # 3D 모델 로더
├── App.tsx              # 메인 앱 컴포넌트
├── constants.ts         # 상수 정의
├── face.glb            # 3D 모델 파일
└── index.html          # HTML 엔트리포인트
```

## 🎯 Performance Optimizations

- ✅ Memoized AI instance to prevent unnecessary recreations
- ✅ useCallback and useMemo for expensive computations
- ✅ React.memo for component optimization
- ✅ Lazy loading for images
- ✅ Constant values extracted from components
- ✅ Optimized Three.js rendering with proper frame updates

## 📝 License

This project is part of SDM APE LAB research initiative.

## 📧 Contact

- Email: kitschkitschyayajjajja@gmail.com
- Instagram: [@sdm.ape.lab](https://www.instagram.com/sdm.ape.lab)
