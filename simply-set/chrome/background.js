let value = ``

chrome.runtime.onInstalled.addListener(() => {
    console.log(`Running Background Script`)

    chrome.contextMenus.create({
        id: `copyValueContext`,
        title: `Copy Value`, 
        contexts: [`all`], 
    })

    chrome.contextMenus.create({
        id: `setValueContext`,
        title: `Set Value`, 
        contexts: [`all`], 
    })

    chrome.contextMenus.create({
        id: `clearLocalSessionContext`,
        title: `Clear`, 
        contexts: [`all`], 
    })

    chrome.contextMenus.create({
        id: `copyClipboardContext`,
        title: `Copy to Clipboard`, 
        contexts: [`all`], 
    })
});


chrome.contextMenus.onClicked.addListener((info, tab) => {
    let menuItemId = info.menuItemId

    switch (menuItemId) {
        case `copyClipboardContext`:
            copyValueToClipboard(tab)
            break
        case `setValueContext`:
            setValue(tab)
            break
        case `copyValueContext`:
            copyValue(tab)
            break
        case `clearLocalSessionContext`:
            clearValue(tab)
            break
        default:
            console.log(`Unknown Error: ${menuItemId} does not exist`)
    }
})


const setValue = tab => {
    chrome.scripting.executeScript({
        target: {tabId: tab.id},
        function: () => {
            chrome.storage.sync.get(['key'], result => {
                let key = result.key
                let valueData

                chrome.storage.sync.get([key], result => {
                    console.log(`${key} has been set to: ${result[key]}`)
                    valueData = result[key]
                    localStorage.setItem(key, valueData)
                })

                chrome.storage.sync.get(['refreshOnLoad'], result => {
                    if(result.refreshOnLoad) {
                        location.reload()
                    }
                })
            })
        },
    })
}

const copyValue = tab => {
    chrome.scripting.executeScript({
        target: {tabId: tab.id},
        function: () => {
            chrome.storage.sync.get(['key'], result => {
                let key = result.key
                let value = localStorage.getItem(key)
            
                switch(value) {
                    case ``:
                        console.warn(`(CopyValue) ${key} was found but does not contain anything`,)
                        break
                    case null:
                        console.warn(`(CopyValue) ${key} was not found in local storage`)
                        break
                    default:
                        chrome.storage.sync.set({[key]: value}, () => {
                            console.log(`(CopyValue) ${key}'s value has been saved as: ${value}`)
                        });
                }
            })
        },
    })
}

const clear = tab => {
    chrome.scripting.executeScript({
        target: {tabId: tab.id},
        function: () => {
            localStorage.clear()
            sessionStorage.clear()
            console.log(`Local & Session Storage Have Been Cleared`)
        },
    })
}

const copyToClipboard = tab => {
    chrome.scripting.executeScript({
        target: {tabId: tab.id},
        function: () => {
            chrome.storage.sync.get(['key'], result => {
                let key = result.key

                navigator.permissions.query({name: `clipboard-write`}).then(result => {
                    if (result.state == `granted` || result.state == `prompt`) {
                        let value = localStorage.getItem(`${key}`)

                        switch(value) {
                            case ``:
                                console.warn(`(Clipboard) ${key} exists but contains nothing`)
                                break
                            case null:
                                console.warn(`(Clipboard) ${key} was not found in local storage`)
                                break
                            default:
                                try {
                                    navigator.clipboard.writeText(value)
                                    console.log(`(Clipboard) ${key} has been copied to the clipboard`)
                                } catch (error) {
                                    console.log(`(Clipboard) An error has occurred:`)
                                    console.error(error.name, error.message);
                                }
                        }
                    } else {
                        console.warn(`(Clipboard) Permissions to write to clipboard not given!`)
                    }
                });
            })
        },
    })
}