```json
{
  "@types/react": "17.0.47"
}
```

Package `@types/react` should not be further updated because version `17.0.48` and up introduces the package.json
exports map which in turn breaks the next.js's missing dependencies detector. 
