# 앱에서의 네비게이션

> treads://@eastzoo
> // 액티비티 폴더안의 recommend.tsx
> thread://activity/recommend

- 위와 같이 웹에서 처럼 앱이름을 프로토콜로 하여 페이지 이동한다.

# 리액트 네비게이션의 종류

// stack -> 기존의 브라우저 스택 느낌, 예전페이지들이 메모리에 남아있음, 뒤로가기 기능
// tab -> 카카오톡 , 스레드의 하단바
// drawer -> 서랍이라는 뜻 , 햄버거 메뉴, 사이드 메뉴등 ( 별도 설치 필요 )

# (tabs) 와 같이 소괄호가 붙은 폴더는 네비게이션의 경로에 영향을 미치지 않는다

# 메인 탭에서 여러 탭을 누르고 뒤로가기를 누르면 항상 첫번째 홈으로 이동하는 이슈

> 커스터 마이징이 가능하다, 공식문서 참조

# router 쓰임

router.push => 히스토리에 쌓임
router.replace => 마지막 push 빼고 하나도 안쌓임
router.navigate => 아무리 눌러도 스택안에서 중복을 제거 distinct 같은 동작

# SafeArea 를 판단해주는 라이브러리가 있다

https://docs.expo.dev/versions/latest/sdk/safe-area-context/

```sh
    npx expo install react-native-safe-area-context
```

# rn에서는 flexDirection이 기본이 column이다 그래서 alignItems와 justifyContent 등의 쓰임새가 반대!

> 리액트 에니메이션 라이브러리 추천
> https://docs.expo.dev/versions/latest/sdk/reanimated/ > https://docs.expo.dev/versions/latest/sdk/lottie/

# FlatList

스크롤 안에 리스트 들어갈때 성능 최적화
현재 보이는 리스트들만 자동 캐시

# 모킹 라이브러리

`npm i miragejs`
