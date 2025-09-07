/**
 * Metro configuration for React Native
 * https://github.com/facebook/metro
 */

const { getDefaultConfig, mergeConfig } = require('@react-native/metro-config');
const path = require('path');

/**
 * Metro configuration
 */
const config = {
  resolver: {
    // 웹과 네이티브 플랫폼용 확장자 해상도
    platforms: ['native', 'android', 'ios', 'web'],
    alias: {
      '@': path.resolve(__dirname, 'src'),
    },
    // React Native Web을 위한 확장자
    sourceExts: ['js', 'json', 'ts', 'tsx', 'jsx'],
    assetExts: [
      'glb',
      'gltf',
      'png',
      'jpg',
      'jpeg',
      'gif',
      'svg',
      'bmp',
      'webp',
      'm4v',
      'mov',
      'mp4',
      'mpeg',
      'mpg',
      'webm',
      'aac',
      'aiff',
      'caf',
      'm4a',
      'mp3',
      'wav',
      'html',
      'pdf',
      'ttf',
      'otf',
      'woff',
      'woff2'
    ]
  },
  transformer: {
    babelTransformerPath: require.resolve('react-native-svg-transformer'),
    getTransformOptions: async () => ({
      transform: {
        experimentalImportSupport: false,
        inlineRequires: true,
      },
    }),
  },
  watchFolders: [
    path.resolve(__dirname, 'src'),
    path.resolve(__dirname, 'assets')
  ]
};

module.exports = mergeConfig(getDefaultConfig(__dirname), config);