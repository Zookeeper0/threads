# 환경 변수 설정 가이드

## 개요

이 프로젝트는 `app.config.js`를 사용하여 환경 변수를 관리합니다. 특히 Naver Map의 `client_id`를 환경 변수로 관리하여 보안을 향상시킵니다.

## 설정 방법

### 1. 환경 변수 파일 생성

프로젝트 루트에 `.env` 파일을 생성하고 다음 내용을 추가하세요:

```bash
# .env 파일
NAVER_MAP_CLIENT_ID=your_actual_client_id_here
```

### 2. 환경 변수 예시 파일

`env.example` 파일을 참고하여 필요한 환경 변수를 설정하세요:

```bash
# env.example 파일을 복사하여 .env 파일 생성
cp env.example .env
```

### 3. .env 파일 편집

`.env` 파일에서 실제 값으로 변경하세요:

```bash
# .env
NAVER_MAP_CLIENT_ID=htawc4jdu4
```

## 환경 변수 목록

| 변수명                | 설명                        | 기본값       | 필수 여부 |
| --------------------- | --------------------------- | ------------ | --------- |
| `NAVER_MAP_CLIENT_ID` | Naver Map API 클라이언트 ID | `htawc4jdu4` | ✅ 필수   |

## 보안 주의사항

### 1. .env 파일을 Git에 커밋하지 마세요

```bash
# .gitignore에 다음 내용이 포함되어 있는지 확인
.env
.env.local
.env.*.local
```

### 2. 프로덕션 환경

프로덕션 환경에서는 환경 변수를 직접 설정하거나, CI/CD 파이프라인을 통해 주입하세요.

## 사용법

### 1. 코드에서 환경 변수 접근

```typescript
import Constants from "expo-constants";

const naverMapClientId = Constants.expoConfig?.extra?.naverMapClientId;
```

### 2. 설정 확인

```typescript
// app.config.js에서 설정된 값 확인
console.log("Naver Map Client ID:", process.env.NAVER_MAP_CLIENT_ID);
```

## 문제 해결

### 1. 환경 변수가 로드되지 않는 경우

- `.env` 파일이 프로젝트 루트에 있는지 확인
- `dotenv` 패키지가 설치되어 있는지 확인
- 앱을 재시작

### 2. 빌드 오류

```bash
# 의존성 재설치
npm install

# 캐시 클리어
npx expo start --clear
```

## 추가 환경 변수

필요에 따라 다음 환경 변수들을 추가할 수 있습니다:

```bash
# API 설정
API_URL=https://api.example.com
API_KEY=your_api_key_here

# 디버그 모드
DEBUG_MODE=true

# 로그 레벨
LOG_LEVEL=info
```

## 참고 자료

- [Expo Configuration](https://docs.expo.dev/guides/config-intro/)
- [Environment Variables](https://docs.expo.dev/guides/environment-variables/)
- [dotenv](https://www.npmjs.com/package/dotenv)
