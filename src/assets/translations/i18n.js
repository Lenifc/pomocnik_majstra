// credits: https://gist.github.com/dasmikko/aa28a4c42312b558a251ab4fc1049f0c

let langs = {}

function setDeepValue(obj, path, value) {
    let newPath = [...path]
    const currentKey = newPath[0]

    if (newPath.length > 1) {
        if (!obj[currentKey]) obj[currentKey] = {}
        newPath.shift() // Remove first item
        setDeepValue(obj[currentKey], newPath, value)
    } else {
        obj[currentKey] = value
    }
}

function stepObject(obj, currentPath) {
    for (var key in obj) {
        // Do the recursive
        if (typeof obj[key] === 'object') {
            stepObject(obj[key], [...currentPath, key])
        }

        if (typeof obj[key] === 'string') {
            const language = key
            const stringValue = obj[key]

            if (!Object.prototype.hasOwnProperty.call(langs, language)) {
                langs[language] = {}
            }

            setDeepValue(langs[language], currentPath, stringValue)
        }
    }
}

export function splitLangJson(json) {
    stepObject(json, [])
    return langs
}
