// Put all the javascript code here, that you want to execute in background.
console.log('Background Script is Running')
browser.menus.create({
    id: `copyValueContext`,
    title: `Copy Value`, 
    contexts: [`all`], 
})

browser.menus.create({
    id: `setValueContext`,
    title: `Set Value`, 
    contexts: [`all`], 
})

browser.menus.create({
    id: `clearLocalSessionContext`,
    title: `Clear`, 
    contexts: [`all`], 
})

browser.menus.create({
    id: `copyClipboardContext`,
    title: `Copy to Clipboard`, 
    contexts: [`all`], 
})

browser.menus.onClicked.addListener((info, tab) => {
    let menuItemId = info.menuItemId
    let tabId = tab.id

    switch (menuItemId) {
        case `copyClipboardContext`:
            copyValueToClipboard(tabId)
            break
        case `setValueContext`:
            setValue(tabId)
            break
        case `copyValueContext`:
            copyValue(tabId)
            break
        case `clearLocalSessionContext`:
            clearValue(tabId)
            break
        default:
            copyValueToClipboard(`Unknown Error: ${menuItemId} does not exist`)
    }
})


const copyValue = tabId => {
    browser.scripting.executeScript({
        target: {
            tabId: tabId
        },
        func: () => {
            browser.storage.sync.get(['key']), result => {
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
                        browser.storage.sync.set({[key]: value}, () => {
                            console.log(`(CopyValue) ${key}'s value has been saved as: ${value}`)
                        });
                }
            }
        }
    })
}

const setValue = async tabId => {
    await browser.scripting.executeScript({
        target: {
            tabId: tabId
        },
        func: () => {
            browser.storage.sync.get(['key'], result => {
                let key = result.key
                let value

                browser.storage.sync.get([key], result => {
                    console.log(`${key} has been set to: ${result[key]}`)
                    value = result[key]
                    localStorage.setItem(key, value)
                })

                browser.storage.sync.get(['refreshOnLoad'], result => {
                    if(result.refreshOnLoad) {
                        location.reload()
                    }
                })
            })
        },
    })
}

const clearValue = async tabId => {
    await browser.scripting.executeScript({
        target: {
            tabId: tabId
        },
        func: () => {
            localStorage.clear()
            sessionStorage.clear()
            console.log(`Local & Session Storage Have Been Cleared`)
        },
    })
}

const copyValueToClipboard = async tabId => {
    await browser.scripting.executeScript({
        target: {
            tabId:tabId
        },
        func: () => {
            broswer.storage.sync.get(['key'], result => {
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