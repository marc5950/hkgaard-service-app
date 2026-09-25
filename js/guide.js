/* ============================================================================
   GUIDE-MODAL · HESTKØBGAARD
   ----------------------------------------------------------------------------
   Rolleguiden med alle faneblade. Selvstændig modal — lukke-knapperne bindes
   internt. "guideToggle"-knappen i admin-menuen bindes i app.js, fordi den
   skal lukke admin-menuen først.
   ============================================================================ */

export const guideModal = document.querySelector("#guideModal");
const guideTabs = document.querySelector("#guideTabs");
const guideBody = document.querySelector("#guideBody");

const GUIDE_SECTIONS = [
	{
		id: "overblik",
		label: "Overblik",
		html: `
            <div class="space-y-5">
                <p class="text-sm text-slate-600">
                    Alle fem roller har hver sit ansvar. Ordreansvarlig kan være samme person som Vært uden for rush-perioderne.
                    Under rush bør de være to.
                </p>

                <div class="overflow-x-auto rounded-xl border border-slate-200">
                    <table class="w-full text-left text-xs sm:text-sm">
                        <thead class="bg-slate-100 text-slate-700">
                            <tr>
                                <th class="px-3 py-2 font-bold">Rolle</th>
                                <th class="px-3 py-2 font-bold">Hvor</th>
                                <th class="px-3 py-2 font-bold">Bruger primært</th>
                            </tr>
                        </thead>
                        <tbody class="divide-y divide-slate-100">
                            <tr><td class="px-3 py-2 font-bold">🎩 Vært</td><td class="px-3 py-2">Ved indgangen</td><td class="px-3 py-2">📅 Find en reservation</td></tr>
                            <tr><td class="px-3 py-2 font-bold">🍽️ Områdeansvarlig</td><td class="px-3 py-2">På gulvet, faste borde</td><td class="px-3 py-2">🍽️ Borde</td></tr>
                            <tr><td class="px-3 py-2 font-bold">👨‍🍳 Ordreansvarlig</td><td class="px-3 py-2">I køkkenet</td><td class="px-3 py-2">👨‍🍳 Køkken + 🏃 Runner</td></tr>
                            <tr><td class="px-3 py-2 font-bold">🏃 Runner / afrydder</td><td class="px-3 py-2">Løber</td><td class="px-3 py-2">Intet — får besked mundtligt</td></tr>
                            <tr><td class="px-3 py-2 font-bold">🍹 Bar</td><td class="px-3 py-2">I baren</td><td class="px-3 py-2">🍹 Bar</td></tr>
                        </tbody>
                    </table>
                </div>

                <div>
                    <h3 class="mb-2 font-display text-xl font-bold text-slate-900">Det store flow</h3>
                    <ol class="space-y-1.5 text-sm text-slate-700">
                        <li><strong>1.</strong> Vært markerer gæsten ankommet → bordet bliver <span class="rounded-full bg-rose-100 px-2 py-0.5 text-[11px] font-bold text-rose-800">RØDT</span></li>
                        <li><strong>2.</strong> Tjener serverer velkomstdrink og trykker <em>Drikkevarer serveret</em></li>
                        <li><strong>3.</strong> Runneren får automatisk besked om at hente forretten</li>
                        <li><strong>4.</strong> Ordreansvarlig trykker <em>Kør</em> på runner-siden → bordet bliver <span class="rounded-full bg-amber-100 px-2 py-0.5 text-[11px] font-bold text-amber-800">GULT</span></li>
                        <li><strong>5.</strong> Tjener trykker <em>Bestil hovedret</em> → køkkenet får ordren</li>
                        <li><strong>6.</strong> Køkken trykker <em>Ready</em> → Ordreansvarlig sender en runner og trykker <em>Kør</em> → bordet bliver <span class="rounded-full bg-sky-100 px-2 py-0.5 text-[11px] font-bold text-sky-800">BLÅT</span></li>
                        <li><strong>7.</strong> Samme mønster for dessert → bordet bliver <span class="rounded-full bg-emerald-100 px-2 py-0.5 text-[11px] font-bold text-emerald-800">GRØNT</span></li>
                        <li><strong>8.</strong> Tjener trykker <em>Afslut bord</em>, når betalingen er gennemført</li>
                    </ol>
                </div>

                <div class="rounded-xl bg-slate-100 p-3 text-sm text-slate-700">
                    <p class="font-bold">Walk-in borde</p>
                    <p class="mt-1">Kommer der gæster uden reservation, åbner vært <strong>📅 Find en reservation</strong> og trykker <strong>+ Tilføj walk-in</strong>. Udfyld hold, bord, navn og antal pax — så er bordet oprettet og klar til tjenerne.</p>
                </div>

                <div class="rounded-xl bg-violet-50 p-3 text-sm text-violet-900 ring-1 ring-violet-200">
                    <p class="font-bold">Undervejs: Ekstra drikkevarer</p>
                    <p class="mt-1">Tjener tilføjer varer fra bordets modal → baren får ordren → bar trykker <em>Klar</em> → runner bærer ud → Ordreansvarlig trykker <em>Kør</em> på runner-siden.</p>
                </div>
            </div>`,
	},
	{
		id: "vaert",
		label: "🎩 Vært",
		html: `
            <div class="space-y-4">
                <p class="text-sm font-bold text-rose-700">Står ved indgangen og tager imod gæsterne.</p>

                <div>
                    <h3 class="mb-2 text-sm font-bold text-slate-800">Gæster med reservation</h3>
                    <ol class="space-y-1.5 text-sm text-slate-700">
                        <li><strong>1.</strong> Åbn <strong>📅 Find en reservation</strong> (den runde knap i højre side).</li>
                        <li><strong>2.</strong> Søg på gæstens navn — søgningen dækker automatisk alle hold.</li>
                        <li><strong>3.</strong> Tryk <strong>Ankommet</strong> ud for reservationen.</li>
                        <li><strong>4.</strong> Før gæsterne til bordet og sig velkommen.</li>
                    </ol>
                </div>

                <div>
                    <h3 class="mb-2 text-sm font-bold text-slate-800">Gæster uden reservation (walk-in)</h3>
                    <ol class="space-y-1.5 text-sm text-slate-700">
                        <li><strong>1.</strong> Åbn <strong>📅 Find en reservation</strong>.</li>
                        <li><strong>2.</strong> Tryk <strong>+ Tilføj walk-in</strong> øverst.</li>
                        <li><strong>3.</strong> Vælg hold, bord og skriv gæstens navn.</li>
                        <li><strong>4.</strong> Indtast antal pax (og evt. pescetarer, velkomstdrink, vinmenu).</li>
                        <li><strong>5.</strong> Tryk <strong>Opret bord</strong>. Gæsterne er nu markeret ankommet.</li>
                    </ol>
                </div>

                <div>
                    <h3 class="mb-2 text-sm font-bold text-slate-800">Godt at vide</h3>
                    <ul class="space-y-1.5 text-sm text-slate-700">
                        <li>• Kun ledige borde vises i walk-in dropdown'en, grupperet pr. lokale.</li>
                        <li>• Kombinerede borde (fx 101+102) vises som ét valg, men kun hvis begge enkeltborde er ledige.</li>
                        <li>• Walk-in borde kan fjernes igen ved at åbne bordet og trykke "Fjern walk-in bord" nederst.</li>
                        <li>• Under rush: dobbelttjek bordnummeret mod bordskiltet.</li>
                    </ul>
                </div>

                <div class="rounded-xl bg-rose-50 p-3 text-sm text-rose-900 ring-1 ring-rose-200">
                    Du er færdig med din opgave, når bordet står som <strong>RØDT</strong> i oversigten.
                </div>
            </div>`,
	},
	{
		id: "omraade",
		label: "🍽️ Områdeansvarlig",
		html: `
            <div class="space-y-4">
                <p class="text-sm font-bold text-amber-700">Har ansvar for faste borde. Tager imod bestillinger og serverer.</p>

                <div>
                    <h3 class="mb-2 text-sm font-bold text-slate-800">Velkomstdrink (når bordet er RØDT)</h3>
                    <ul class="space-y-1.5 text-sm text-slate-700">
                        <li>• Hent velkomstdrinken i baren og sæt den på bordet.</li>
                        <li>• Tryk <strong>Drikkevarer serveret</strong> i bordets modal.</li>
                        <li>• Appen sender nu automatisk besked til runneren om, at forretten skal ud.</li>
                    </ul>
                </div>

                <div>
                    <h3 class="mb-2 text-sm font-bold text-slate-800">Ekstra drikkevarer (løbende)</h3>
                    <ul class="space-y-1.5 text-sm text-slate-700">
                        <li>• Åbn bordet og tryk <strong>+ Tilføj drikkevarer</strong>.</li>
                        <li>• Vælg varer med <strong>+/−</strong>.</li>
                        <li>• Tryk <strong>Færdig (send til bar)</strong>. Baren får ordren øjeblikkeligt.</li>
                        <li>• Du kan rette antallet igen senere — barens kø opdateres, når du trykker Færdig.</li>
                    </ul>
                </div>

                <div>
                    <h3 class="mb-2 text-sm font-bold text-slate-800">Mad</h3>
                    <ul class="space-y-1.5 text-sm text-slate-700">
                        <li>• Tryk <strong>Bestil hovedret</strong>, når bordet er klar. Køkkenet får ordren.</li>
                        <li>• Når Ordreansvarlig har trykket Kør på runner-siden, bliver bordet BLÅT.</li>
                        <li>• Tryk <strong>Bestil dessert</strong>, når gæsterne er klar til det.</li>
                        <li>• Når dessert er kørt ud, bliver bordet GRØNT.</li>
                    </ul>
                </div>

                <div>
                    <h3 class="mb-2 text-sm font-bold text-slate-800">Afslutning</h3>
                    <ul class="space-y-1.5 text-sm text-slate-700">
                        <li>• Tryk <strong>Afslut bord (regning skal være betalt)</strong> — først når betalingen er gennemført i baren.</li>
                        <li>• Bordet flytter ned i "Afsluttede borde".</li>
                    </ul>
                </div>

                <div class="rounded-xl bg-amber-50 p-3 text-sm text-amber-900 ring-1 ring-amber-200">
                    <p class="font-bold">Genvej under rush</p>
                    <p class="mt-1">Den blinkende prik på bordkortet betyder: maden står klar. Du kan klikke direkte på prikken for at markere, at den er bragt ud — uden at åbne bordet.</p>
                </div>
            </div>`,
	},
	{
		id: "ordre",
		label: "👨‍🍳 Ordreansvarlig",
		html: `
            <div class="space-y-4">
                <p class="text-sm font-bold text-sky-700">Styrer køkkenet, fordeler arbejdet og opdaterer status i appen.</p>

                <div>
                    <h3 class="mb-2 text-sm font-bold text-slate-800">Køkken (👨‍🍳 fanen)</h3>
                    <ul class="space-y-1.5 text-sm text-slate-700">
                        <li>• Køkkenet får automatisk hovedret- og dessert-ordrer, når tjenerne trykker Bestil.</li>
                        <li>• Når en ret er færdig, trykker køkkenet <strong>Ready</strong>. Så får runnerne besked via dig.</li>
                        <li>• Øverst i køkkenvisningen kan du se, hvor mange <strong>pax der mangler</strong> af hver ret, og hvor længe hver ordre har ventet (farveskift ved 10 og 20 min).</li>
                    </ul>
                </div>

                <div>
                    <h3 class="mb-2 text-sm font-bold text-slate-800">Runner (🏃 fanen)</h3>
                    <ul class="space-y-1.5 text-sm text-slate-700">
                        <li>• Her ser du alt, hvad der står klar til at blive båret ud — både fra køkken og bar.</li>
                        <li>• <strong>Fordel arbejdet:</strong> peg på et kort og sig til en runner: <em>"Lokale, bord nr og antal pax"</em>.</li>
                        <li>• Når runneren har bekræftet, at retten er bragt ud, trykker <strong>du</strong> <em>Kør</em> på kortet. Det opdaterer bordets status med det samme.</li>
                    </ul>
                </div>

                <div>
                    <h3 class="mb-2 text-sm font-bold text-slate-800">Forret — særligt ansvar</h3>
                    <ul class="space-y-1.5 text-sm text-slate-700">
                        <li>• Forretter laves <strong>samlet i køkkenet</strong>, ikke pr. bord.</li>
                        <li>• Sørg for at køkkenet har overblik over, hvor mange der mangler.</li>
                        <li>• Tælleren "Forret mangler" i køkkenvisningen viser, hvor mange kuverter der endnu ikke er serveret.</li>
                    </ul>
                </div>

                <div class="rounded-xl bg-sky-50 p-3 text-sm text-sky-900 ring-1 ring-sky-200">
                    <p class="font-bold">Du er appens "kaptajn" under rush</p>
                    <p class="mt-1">Tjenerne bestiller maden, køkkenet laver den — men det er dig, der sørger for at runnerne får besked, og at status bliver trykket korrekt ind.</p>
                </div>
            </div>`,
	},
	{
		id: "koekken",
		label: "🍳 Køkken",
		html: `
            <div class="space-y-4">
                <p class="text-sm font-bold text-amber-700">Laver maden. Holder styr på ordrerne på skærmen og melder retter klar.</p>

                <div>
                    <h3 class="mb-2 text-sm font-bold text-slate-800">Køkken (👨‍🍳 fanen)</h3>
                    <ul class="space-y-1.5 text-sm text-slate-700">
                        <li>• Hver ordre viser <strong>bord, lokale, antal pax og en eventuel note</strong>.</li>
                        <li>• Klassisk og pescetar står som separate linjer under hovedretten — så I ved, hvor mange af hver der skal laves.</li>
                        <li>• En farvet <strong>ventetids-badge</strong> på hver ret skifter ved 10 min (gul) og 20 min (rød), så I kan se, hvilket bord der har ventet længst.</li>
                    </ul>
                </div>

                <div>
                    <h3 class="mb-2 text-sm font-bold text-slate-800">Sådan melder I en ret færdig</h3>
                    <ol class="space-y-1.5 text-sm text-slate-700">
                        <li><strong>1.</strong> Find bordets kort i køen.</li>
                        <li><strong>2.</strong> Tryk <strong>Ready</strong> på den ret, der er klar.</li>
                        <li><strong>3.</strong> Ordren flytter til Runner-fanen, hvor Ordreansvarlig sender en runner.</li>
                    </ol>
                </div>

                <div>
                    <h3 class="mb-2 text-sm font-bold text-slate-800">Forret — samlet produktion</h3>
                    <ul class="space-y-1.5 text-sm text-slate-700">
                        <li>• Forretter laves <strong>samlet</strong>, ikke som enkelte bord-ordrer.</li>
                        <li>• Tælleren <strong>"Forret mangler"</strong> øverst i køkkenvisningen viser, hvor mange kuverter der endnu ikke er serveret for det valgte hold.</li>
                        <li>• Tjek tælleren med jævne mellemrum — den falder, efterhånden som tjenerne trykker "Forret serveret".</li>
                    </ul>
                </div>

                <div>
                    <h3 class="mb-2 text-sm font-bold text-slate-800">Hovedret og dessert</h3>
                    <ul class="space-y-1.5 text-sm text-slate-700">
                        <li>• Hovedret-ordrer kommer ind, når tjeneren trykker "Bestil hovedret".</li>
                        <li>• Dessert-ordrer kommer ind, når tjeneren trykker "Bestil dessert".</li>
                        <li>• Hver ordre kan indeholde både en <strong>klassisk</strong> og en <strong>pescetarisk</strong> linje — begge skal laves.</li>
                    </ul>
                </div>

                <div class="rounded-xl bg-amber-50 p-3 text-sm text-amber-900 ring-1 ring-amber-200">
                    <p class="font-bold">Dagens samlede pax</p>
                    <p class="mt-1">Øverst i køkkenvisningen står dagens samlede antal kuverter — både klassisk og pescetar — så I kan planlægge produktionen på tværs af alle hold.</p>
                </div>

                <div class="rounded-xl bg-slate-100 p-3 text-sm text-slate-700">
                    <p class="font-bold">Noter</p>
                    <p class="mt-1">Noter fra tjenerne vises nederst på bordets kort. De er typisk skrevet til jer (fx "Køkken: glutenallergi"). Læs dem, før I laver retten.</p>
                </div>
            </div>`,
	},
	{
		id: "runner",
		label: "🏃 Runner",
		html: `
            <div class="space-y-4">
                <p class="text-sm font-bold text-violet-700">Løber med mad og drikkevarer ud til bordene.</p>

                <div>
                    <h3 class="mb-2 text-sm font-bold text-slate-800">Din arbejdsdag</h3>
                    <ol class="space-y-1.5 text-sm text-slate-700">
                        <li><strong>1.</strong> Få besked fra Ordreansvarlig: <em>"Lokale, bord nr og antal pax"</em>.</li>
                        <li><strong>2.</strong> Hent retten/drikkevaren i køkkenet eller baren.</li>
                        <li><strong>3.</strong> Bær den ud til bordet og sæt den på bordet.</li>
                        <li><strong>4.</strong> Gå tilbage til Ordreansvarlig og bekræft, at det er bragt ud.</li>
                    </ol>
                </div>

                <div>
                    <h3 class="mb-2 text-sm font-bold text-slate-800">Farvekoderne på runner-kortene</h3>
                    <div class="space-y-1.5 text-sm">
                        <p><span class="rounded-full bg-amber-100 px-2 py-0.5 text-[11px] font-bold text-amber-800">GUL</span> = forret</p>
                        <p><span class="rounded-full bg-sky-100 px-2 py-0.5 text-[11px] font-bold text-sky-800">BLÅ</span> = hovedret</p>
                        <p><span class="rounded-full bg-emerald-100 px-2 py-0.5 text-[11px] font-bold text-emerald-800">GRØN</span> = dessert</p>
                        <p><span class="rounded-full bg-violet-100 px-2 py-0.5 text-[11px] font-bold text-violet-800">LILLA</span> = drikkevare</p>
                    </div>
                </div>

                <div>
                    <h3 class="mb-2 text-sm font-bold text-slate-800">Afrydning</h3>
                    <ul class="space-y-1.5 text-sm text-slate-700">
                        <li>• Når et bord er færdige med at spise dessert, kan det ryddes.</li>
                        <li>• Afrydningen er ikke en handling i appen — men sig til tjeneren, når bordet er tomt, så det kan afsluttes.</li>
                    </ul>
                </div>

                <div class="rounded-xl bg-violet-50 p-3 text-sm text-violet-900 ring-1 ring-violet-200">
                    <p class="font-bold">Du skal ikke trykke på appen</p>
                    <p class="mt-1">Ordreansvarlig styrer appen, mens du og de andre runnere fysisk bærer maden ud. Bekræft mundtligt, når retten er sat på bordet.</p>
                </div>
            </div>`,
	},
	{
		id: "bar",
		label: "🍹 Bar",
		html: `
            <div class="space-y-4">
                <p class="text-sm font-bold text-violet-700">Ansvarlig for alle drikkevarer — både før og under rushet.</p>

                <div>
                    <h3 class="mb-2 text-sm font-bold text-slate-800">Før rush</h3>
                    <ul class="space-y-1.5 text-sm text-slate-700">
                        <li>• Lav velkomstdrinks <strong>på forhånd</strong> baseret på dagens samlede antal gæster.</li>
                        <li>• I toppen af Bar-fanen står den samlede oversigt: hvor mange velkomstdrinks, vinmenu og vin/pescetar der er booket for det valgte hold.</li>
                    </ul>
                </div>

                <div>
                    <h3 class="mb-2 text-sm font-bold text-slate-800">Under rush — ekstra drikkevarer</h3>
                    <ol class="space-y-1.5 text-sm text-slate-700">
                        <li><strong>1.</strong> Tjeneren sender en drikkevare-ordre fra bordet.</li>
                        <li><strong>2.</strong> Den lander i <strong>🍹 Bar</strong>-fanen.</li>
                        <li><strong>3.</strong> Tryk <strong>Klar</strong>, når drikkevaren er lavet.</li>
                        <li><strong>4.</strong> Ordren flytter automatisk til Runner-fanen, hvor Ordreansvarlig sender en runner.</li>
                    </ol>
                </div>

                <div>
                    <h3 class="mb-2 text-sm font-bold text-slate-800">Hvad baren IKKE skal gøre</h3>
                    <ul class="space-y-1.5 text-sm text-slate-700">
                        <li>• <strong>Velkomstdrinks</strong> står ikke i bar-køen — tjeneren henter dem selv og markerer "Drikkevarer serveret" på bordet.</li>
                        <li>• <strong>Vinmenu</strong> (forudbestilt) står heller ikke i køen — den skænkes ved bordet af tjeneren.</li>
                    </ul>
                </div>

                <div>
                    <h3 class="mb-2 text-sm font-bold text-slate-800">Opstock</h3>
                    <ul class="space-y-1.5 text-sm text-slate-700">
                        <li>• I toppen af Bar-fanen vises en oversigt over, hvad der i øjeblikket er bestilt på tværs af alle borde (fx "Sodavand: 9 · Øl: 6").</li>
                        <li>• Brug den til at vurdere, om der skal fyldes op i køleskabet.</li>
                    </ul>
                </div>

                <div>
                    <h3 class="mb-2 text-sm font-bold text-slate-800">Betaling</h3>
                    <ul class="space-y-1.5 text-sm text-slate-700">
                        <li>• Når tjeneren siger, at et bord skal betale, slå reservationen op under <strong>📅 Find en reservation</strong>.</li>
                        <li>• Kontroller: antal pax, vinmenu / drikmenu / velkomstdrink og de ekstra drikkevarer (ses i bordets modal).</li>
                        <li>• Efter betaling siger du til tjeneren, at bordet kan afsluttes.</li>
                    </ul>
                </div>
            </div>`,
	},
	{
		id: "drikke",
		label: "🍹 Drikkevare-flow",
		html: `
            <div class="space-y-4">
                <h3 class="mb-2 font-display text-xl font-bold text-slate-900">Ekstra drikkevarer</h3>
                <ol class="space-y-1.5 text-sm text-slate-700">
                    <li><strong>1.</strong> Tjener trykker <em>+ Tilføj drikkevarer</em> på bordet.</li>
                    <li><strong>2.</strong> Vælger varer med <strong>+/−</strong>.</li>
                    <li><strong>3.</strong> Tjener trykker <em>Færdig (send til bar)</em>.</li>
                    <li><strong>4.</strong> Bar ser ordren på 🍹 Bar og trykker <em>Klar</em>.</li>
                    <li><strong>5.</strong> Ordren flytter til runneren.</li>
                    <li><strong>6.</strong> Ordreansvarlig sender en runner ud og trykker <em>Kør</em>.</li>
                </ol>

                <div class="rounded-xl bg-slate-100 p-3 text-sm text-slate-700">
                    <p class="font-bold">Vigtigt</p>
                    <p class="mt-1">Baren får kun ét samlet signal pr. vare. Retter tjeneren antallet ned, trækkes barens ordrer tilsvarende ned ved Færdig. Retter tjeneren op igen, oprettes en ny ordre.</p>
                </div>

                <div class="rounded-xl bg-rose-50 p-3 text-sm text-rose-900 ring-1 ring-rose-200">
                    <p class="font-bold">Særregel — velkomstdrinks og vinmenu</p>
                    <p class="mt-1">Velkomstdrinks laves <strong>på forhånd</strong> af baren, men står ikke i køen. Vinmenu skænkes ved bordet af tjeneren. Kun ekstra drikkevarer (sodavand, øl, kaffe osv.) går gennem bar-køen.</p>
                </div>
            </div>`,
	},
	{
		id: "walkin",
		label: "🚶 Walk-in",
		html: `
            <div class="space-y-4">
                <h3 class="mb-2 font-display text-xl font-bold text-slate-900">Gæster uden reservation</h3>
                <p class="text-sm text-slate-600">
                    Kommer der gæster uden en reservation, opretter vært et walk-in bord. Bordet opfører sig herefter som alle andre borde — det kommer blot ind i systemet uden om importen.
                </p>

                <div>
                    <h3 class="mb-2 text-sm font-bold text-slate-800">Sådan opretter du et walk-in bord</h3>
                    <ol class="space-y-1.5 text-sm text-slate-700">
                        <li><strong>1.</strong> Åbn <strong>📅 Find en reservation</strong>.</li>
                        <li><strong>2.</strong> Tryk <strong>+ Tilføj walk-in</strong> øverst i modalen.</li>
                        <li><strong>3.</strong> Vælg <strong>hold</strong> (fx 17:30).</li>
                        <li><strong>4.</strong> Vælg <strong>bord</strong> i dropdown'en — kun ledige borde vises, grupperet pr. lokale, med bordskilt-nummer og maks pax.</li>
                        <li><strong>5.</strong> Skriv et <strong>navn</strong> — det bruges til at finde bordet ved betaling.</li>
                        <li><strong>6.</strong> Indtast <strong>antal gæster</strong>, evt. hvor mange der er pescetarer, og forudbestilte drikkevarer (velkomstdrink, vinmenu, vin/pescetar).</li>
                        <li><strong>7.</strong> Skriv evt. en note.</li>
                        <li><strong>8.</strong> Tryk <strong>Opret bord</strong>.</li>
                    </ol>
                </div>

                <div>
                    <h3 class="mb-2 text-sm font-bold text-slate-800">Kombinerede borde (fx 101+102)</h3>
                    <p class="text-sm text-slate-700">Nogle borde kan slås sammen til et større bord. De vises som ét samlet valg i dropdown'en ("Bord 101 + 102 · maks 4 pax (sammenslået)"), men <strong>kun hvis begge enkeltborde er ledige</strong>. Er blot ét af dem optaget, forsvinder det kombinerede valg, og de enkelte borde kan heller ikke vælges.</p>
                </div>

                <div class="rounded-xl bg-amber-50 p-3 text-sm text-amber-900 ring-1 ring-amber-200">
                    <p class="font-bold">Bordet starter som "Ankommet"</p>
                    <p class="mt-1">Gæsterne er jo allerede til stede, så bordet markeres automatisk som ankommet. Tjenerne kan straks begynde at tage imod bestillinger.</p>
                </div>

                <div>
                    <h3 class="mb-2 text-sm font-bold text-slate-800">Hvis I opretter et bord ved en fejl</h3>
                    <p class="text-sm text-slate-700">Åbn bordet i oversigten og tryk <strong>Fjern walk-in bord</strong> nederst i modalen. Bordet fjernes helt — inkl. eventuelle ventende køkken-, bar- og runner-ordrer.</p>
                </div>

                <div>
                    <h3 class="mb-2 text-sm font-bold text-slate-800">Ved import af reservationer</h3>
                    <p class="text-sm text-slate-700">Hvis en importeret reservation rammer et bordnummer, der allerede er et walk-in på samme hold, spørger appen om walk-in'en skal overskrives eller bevares. Vælger du at bevare, springes den importerede reservation over, og du får en besked om det.</p>
                </div>
            </div>`,
	},
	{
		id: "særregler",
		label: "Særregler",
		html: `
            <div class="space-y-4">
                <div>
                    <h3 class="mb-1 text-sm font-bold text-slate-800">1. Forret — særligt flow</h3>
                    <p class="text-sm text-slate-700">Forretter laves samlet i køkkenet, ikke pr. bord. Runneren får automatisk besked, når tjeneren har trykket "Drikkevarer serveret".</p>
                </div>

                <div>
                    <h3 class="mb-1 text-sm font-bold text-slate-800">2. Hvis tjeneren trykker "Afslut bord" for tidligt</h3>
                    <p class="text-sm text-slate-700">Ordren forsvinder fra alle køer, og bordet ryger ned i "Afsluttede borde". Fejlen rettes med <strong>Genåbn</strong> på bordet.</p>
                </div>

                <div>
                    <h3 class="mb-1 text-sm font-bold text-slate-800">3. Hvis en køkken- eller bar-ordre aldrig bliver trykket</h3>
                    <p class="text-sm text-slate-700">Ordren bliver liggende i køen. Hold-fanebladene i topen blinker rødt, hvis der er ventende ordrer på et hold, du ikke selv kigger på.</p>
                </div>

                <div>
                    <h3 class="mb-1 text-sm font-bold text-slate-800">4. Hvis tjeneren selv tager drikkevarer</h3>
                    <p class="text-sm text-slate-700">Tryk <strong>Drikkevarer serveret</strong> i bordets modal. Alle ventende bar- og runner-ordrer for bordet ryddes automatisk.</p>
                </div>

                <div>
                    <h3 class="mb-1 text-sm font-bold text-slate-800">5. Noter</h3>
                    <p class="text-sm text-slate-700">Start noten med hvem den er til: <strong>Tjener</strong>, <strong>Køkken</strong>, <strong>Bar</strong> eller <strong>Runner</strong>. Fx "Køkken: glutenallergi" eller "Bar: ekstra is". Noten vises på bordet, i køkkenet, i baren og hos runneren.</p>
                </div>

                <div>
                    <h3 class="mb-1 text-sm font-bold text-slate-800">6. Nulstilling af en dag</h3>
                    <p class="text-sm text-slate-700"><strong>Nulstil status (alle borde)</strong> i Opsætning rydder status, timere, ekstra drikkevarer, noter og alle køer. Brug den kun, når dagen er slut eller ved fejlstart.</p>
                </div>

                <div>
                    <h3 class="mb-1 text-sm font-bold text-slate-800">7. Walk-ins og import</h3>
                    <p class="text-sm text-slate-700">Ved import af reservationer kan en importeret reservation ramme samme bordnummer og hold som et walk-in bord. Appen spørger, om walk-in'en skal overskrives eller bevares, og giver besked hvis en reservation blev sprunget over.</p>
                </div>
            </div>`,
	},
	{
		id: "reference",
		label: "📋 Reference",
		html: `
            <div class="space-y-3">
                <h3 class="font-display text-xl font-bold text-slate-900">Hvem trykker hvad</h3>
                <div class="overflow-x-auto rounded-xl border border-slate-200">
                    <table class="w-full text-left text-xs sm:text-sm">
                        <thead class="bg-slate-100 text-slate-700">
                            <tr>
                                <th class="px-3 py-2 font-bold">Handling</th>
                                <th class="px-3 py-2 font-bold">Rolle</th>
                                <th class="px-3 py-2 font-bold">Hvor</th>
                            </tr>
                        </thead>
                        <tbody class="divide-y divide-slate-100">
                            <tr><td class="px-3 py-2">Markér gæst ankommet</td><td class="px-3 py-2 font-bold">Vært</td><td class="px-3 py-2">📅 Find en reservation</td></tr>
                            <tr><td class="px-3 py-2">Opret walk-in bord</td><td class="px-3 py-2 font-bold">Vært</td><td class="px-3 py-2">📅 Find en reservation → + Tilføj walk-in</td></tr>
                            <tr><td class="px-3 py-2">Server velkomstdrink</td><td class="px-3 py-2 font-bold">Tjener</td><td class="px-3 py-2">🍽️ Borde → bordet</td></tr>
                            <tr><td class="px-3 py-2">Tilføj ekstra drikkevarer</td><td class="px-3 py-2 font-bold">Tjener</td><td class="px-3 py-2">🍽️ Borde → bordet</td></tr>
                            <tr><td class="px-3 py-2">Lav drikkevare færdig</td><td class="px-3 py-2 font-bold">Bar</td><td class="px-3 py-2">🍹 Bar → Klar</td></tr>
                            <tr><td class="px-3 py-2">Bestil hovedret</td><td class="px-3 py-2 font-bold">Tjener</td><td class="px-3 py-2">🍽️ Borde → bordet</td></tr>
                            <tr><td class="px-3 py-2">Lav mad færdig</td><td class="px-3 py-2 font-bold">Køkken</td><td class="px-3 py-2">👨‍🍳 Køkken → Ready</td></tr>
                            <tr><td class="px-3 py-2">Tryk "Kør" på runner-siden</td><td class="px-3 py-2 font-bold">Ordreansvarlig</td><td class="px-3 py-2">🏃 Runner → Kør</td></tr>
                            <tr><td class="px-3 py-2">Bestil dessert</td><td class="px-3 py-2 font-bold">Tjener</td><td class="px-3 py-2">🍽️ Borde → bordet</td></tr>
                            <tr><td class="px-3 py-2">Afslut bord</td><td class="px-3 py-2 font-bold">Tjener</td><td class="px-3 py-2">🍽️ Borde → bordet</td></tr>
                            <tr><td class="px-3 py-2">Nulstil dag</td><td class="px-3 py-2 font-bold">Ordreansvarlig</td><td class="px-3 py-2">⚙️ Opsætning</td></tr>
                        </tbody>
                    </table>
                </div>
            </div>`,
	},
];

let activeGuideSection = "overblik";

export function openGuide() {
	renderGuideTabs();
	renderGuideBody();
	guideModal.classList.remove("hidden");
	guideModal.classList.add("flex");
}

export function closeGuide() {
	guideModal.classList.add("hidden");
	guideModal.classList.remove("flex");
}

export function isGuideOpen() {
	return !guideModal.classList.contains("hidden");
}

function renderGuideTabs() {
	guideTabs.innerHTML = GUIDE_SECTIONS.map((section) => {
		const isActive = section.id === activeGuideSection;
		return `<button type="button" data-guide-tab="${section.id}" class="shrink-0 whitespace-nowrap rounded-lg px-3 py-1.5 text-xs font-bold transition ${
			isActive ? "bg-slate-900 text-white" : "bg-white text-slate-700 ring-1 ring-slate-200 hover:bg-slate-50"
		}">${section.label}</button>`;
	}).join("");
	guideTabs.querySelectorAll("[data-guide-tab]").forEach((button) =>
		button.addEventListener("click", () => {
			activeGuideSection = button.dataset.guideTab;
			renderGuideTabs();
			renderGuideBody();
			guideBody.scrollTop = 0;
		}),
	);
}

function renderGuideBody() {
	const section = GUIDE_SECTIONS.find((s) => s.id === activeGuideSection) || GUIDE_SECTIONS[0];
	guideBody.innerHTML = section.html;
}

// Guide-modalen håndterer sine egne lukke-knapper.
document.querySelector("#closeGuide").addEventListener("click", closeGuide);
document.querySelector("#closeGuideBottom").addEventListener("click", closeGuide);
guideModal.addEventListener("click", (event) => {
	if (event.target === guideModal) closeGuide();
});
