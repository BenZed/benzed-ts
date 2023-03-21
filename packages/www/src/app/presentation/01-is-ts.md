# is-ts

### Presenting `is-ts` 

Data validation and type guard library with a fluent syntax.

```ts
import is from '@benzed/is'

const name = localStorage.getItem('name')

if (is.string(name))
    console.log(`Welcome back, ${name}`)
```

> is-ts is a yet-to-be-released library I've been building in type script. It allows developers to compose type guards, type asserters and data validation schematics with a fluent and intuitive api.

## is-ts fluency

