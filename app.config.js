import 'dotenv/config';

export default {
    expo: {
        name: "threads",
        slug: "threads",
        version: "1.0.0",
        orientation: "portrait",
        icon: "./src/assets/images/icon.png",
        scheme: "threads",
        userInterfaceStyle: "automatic",
        newArchEnabled: true,
        ios: {
            supportsTablet: true
        },
        android: {
            adaptiveIcon: {
                foregroundImage: "./src/assets/images/adaptive-icon.png",
                backgroundColor: "#ffffff"
            },
            edgeToEdgeEnabled: true,
            package: "com.eastzoo.threads",
            manifestPlaceholders: {
                "com.naver.maps.map.CLIENT_ID": process.env.NAVER_MAP_CLIENT_ID || "htawc4jdu4"
            }
        },
        web: {
            bundler: "metro",
            output: "static",
            favicon: "./src/assets/images/favicon.png"
        },
        plugins: [
            "expo-router",
            [
                "expo-splash-screen",
                {
                    "image": "./src/assets/images/splash-icon.png",
                    "imageWidth": 200,
                    "resizeMode": "contain",
                    "backgroundColor": "#ffffff"
                }
            ],
            [
                "expo-location",
                {
                    "locationAlwaysAndWhenInUsePermission": "Allow $(PRODUCT_NAME) to use your location.",
                    "locationWhenInUsePermission": "Allow $(PRODUCT_NAME) to use your location."
                }
            ],
            [
                "expo-image-picker",
                {
                    "photosPermission": "The app accesses your photos to let you share them in your threads.",
                    "cameraPermission": "The app accesses your camera to let you share photos in your threads."
                }
            ],
            [
                "expo-media-library",
                {
                    "photosPermission": "Allow $(PRODUCT_NAME) to access your photos.",
                    "savePhotosPermission": "Allow $(PRODUCT_NAME) to save photos.",
                    "isAccessMediaLocationEnabled": true
                }
            ],
            [
                "@mj-studio/react-native-naver-map",
                {
                    "client_id": process.env.NAVER_MAP_CLIENT_ID || "htawc4jdu4",
                    "android": {
                        "ACCESS_FINE_LOCATION": true,
                        "ACCESS_COARSE_LOCATION": true
                    }
                }
            ],
            [
                "expo-build-properties",
                {
                    "android": {
                        "extraMavenRepos": [
                            "https://repository.map.naver.com/archive/maven"
                        ]
                    }
                }
            ],
            "expo-secure-store"
        ],
        experiments: {
            typedRoutes: true
        },
        extra: {
            router: {},
            eas: {
                "projectId": "e3844356-41d9-421a-b35c-74af83191854"
            },
            naverMapClientId: process.env.NAVER_MAP_CLIENT_ID || "htawc4jdu4"
        }
    }
};
