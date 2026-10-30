# CoreOS Pro

PWA dimostrativa in HTML, CSS e JavaScript puro.

## App incluse
- Dashboard e dock
- File manager dimostrativo
- Terminale dimostrativo (comandi simulati, non esegue shell)
- Blocco note con salvataggio automatico nel browser
- Calcolatrice
- Calendario locale
- Monitor e impostazioni
- Cursore personalizzato per dispositivi con mouse
- Finestre trascinabili su schermi desktop
- Manifest PWA e service worker per cache offline

## Pubblicazione su Vercel
Carica il contenuto di questa cartella nella radice del repository GitHub collegato a Vercel. Usa Framework Preset `Other`, senza build command e Output Directory `.`. Ogni commit sul branch collegato avvia un nuovo deployment.

## Installazione
- iPhone: apri il sito in Safari → Condividi → Aggiungi alla schermata Home.
- Android: apri il sito in Chrome → menu → Installa app.

## Limiti
CoreOS Pro è un desktop web/PWA, non un vero kernel Linux e non sostituisce iOS o Android. Per sicurezza, il terminale è simulato e il file manager mostra contenuti demo. Gli appunti sono salvati localmente nel browser del dispositivo.


## CoreOS Builder v3
Questa versione aggiunge una procedura di benvenuto, creazione profilo locale,
40 preferenze di personalizzazione, accesso, esportazione/importazione della
configurazione (clonazione), ripristino da zero, logout e schermata di arresto.

**Limite importante:** questa è la prima versione front-end. Il profilo è
memorizzato nel browser del dispositivo e non è ancora un account cloud multiutente.
Per username condivisi tra dispositivi, autenticazione realmente sicura e dati
sincronizzati, occorre collegare un backend e un database. La password non può
essere recuperata in questa versione; il file di clonazione non include la password.


## CoreOS Desktop v4
Interfaccia desktop ridisegnata seguendo il riferimento COSMIC/GNOME fornito:
barra superiore scura, desktop a tutto schermo, icone, dock e launcher applicazioni
con ricerca e categorie. Le applicazioni già presenti restano collegate alle finestre
CoreOS; la voce Firefox apre Google in una nuova scheda del browser.
