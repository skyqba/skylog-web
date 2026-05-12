import { useState } from 'react'
import emailjs from '@emailjs/browser'
import { Link } from 'react-router-dom'
import Navbar from '../components/Navbar'

const Section = ({ id, title, children }) => (
  <div id={id} style={{ marginBottom: '2rem', scrollMarginTop: '80px' }}>
    <h2 style={{ fontFamily: 'var(--head)', fontSize: '1.15rem', fontWeight: 800, color: '#A78BFA', marginBottom: '0.75rem', paddingBottom: '0.4rem', borderBottom: '1px solid var(--border)' }}>{title}</h2>
    {children}
  </div>
)

const Sub = ({ title, children }) => (
  <div style={{ marginBottom: '1rem' }}>
    <h3 style={{ fontFamily: 'var(--head)', fontSize: '0.95rem', fontWeight: 700, color: 'var(--text)', marginBottom: '0.4rem' }}>{title}</h3>
    {children}
  </div>
)

const P = ({ children }) => (
  <p style={{ fontSize: '0.88rem', color: 'var(--muted)', lineHeight: 1.7, marginBottom: '0.5rem' }}>{children}</p>
)

const Ul = ({ items }) => (
  <ul style={{ paddingLeft: '1.25rem', marginBottom: '0.5rem' }}>
    {items.map((item, i) => (
      <li key={i} style={{ fontSize: '0.88rem', color: 'var(--muted)', lineHeight: 1.7, marginBottom: '0.2rem' }}>{item}</li>
    ))}
  </ul>
)

const Ol = ({ items }) => (
  <ol style={{ paddingLeft: '1.25rem', marginBottom: '0.5rem' }}>
    {items.map((item, i) => (
      <li key={i} style={{ fontSize: '0.88rem', color: 'var(--muted)', lineHeight: 1.7, marginBottom: '0.2rem' }}>{item}</li>
    ))}
  </ol>
)

const FieldTable = ({ rows }) => (
  <div style={{ overflowX: 'auto', marginBottom: '0.75rem' }}>
    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem' }}>
      <thead>
        <tr style={{ background: 'var(--accent)' }}>
          <th style={{ padding: '0.5rem 0.75rem', textAlign: 'left', color: '#fff', fontFamily: 'var(--head)', fontSize: '0.78rem', width: '35%' }}>Pole</th>
          <th style={{ padding: '0.5rem 0.75rem', textAlign: 'left', color: '#fff', fontFamily: 'var(--head)', fontSize: '0.78rem' }}>Opis</th>
        </tr>
      </thead>
      <tbody>
        {rows.map(([label, desc], i) => (
          <tr key={i} style={{ borderBottom: '1px solid var(--border)', background: i % 2 === 0 ? 'var(--bg3)' : 'var(--bg2)' }}>
            <td style={{ padding: '0.5rem 0.75rem', fontWeight: 600, color: '#A78BFA', verticalAlign: 'top' }}>{label}</td>
            <td style={{ padding: '0.5rem 0.75rem', color: 'var(--muted)', lineHeight: 1.6 }}>{desc}</td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
)

const tocItems = [
  { label: '1. Czym jest JumpLogX?',                              id: 's1'  },
  { label: '2. Pierwsze kroki — rejestracja i logowanie',         id: 's2'  },
  { label: '3. Dziennik skoków',                                  id: 's3'  },
  { label: '4. Dodawanie nowego skoku',                           id: 's4'  },
  { label: '5. Edycja zapisanych skoków',                         id: 's5'  },
  { label: '6. Profil użytkownika i dokumenty',                   id: 's6'  },
  { label: '7. Eksport skoków — filtrowanie, sortowanie, PDF',    id: 's7'  },
  { label: '8. Import skoków z pliku',                            id: 's8'  },
  { label: '9. Statystyki',                                       id: 's9'  },
  { label: '10. Ustawienia i powiadomienia',                      id: 's10' },
  { label: '11. Motywy aplikacji (Dark Mode / Pro)',               id: 's11' },
  { label: '12. Tryb offline',                                    id: 's12' },
  { label: '13. Bezpieczeństwo i prywatność',                     id: 's13' },
  { label: '14. Przydatne wskazówki',                             id: 's14' },
  { label: '15. Kontakt i pomoc',                                  id: 's15' },
  { label: '16. Regulamin',                                           id: 's16' },
]


function ContactForm() {
  const [form, setForm] = useState({ name:'', email:'', message:'' })
  const [status, setStatus] = useState(null)
  const [loading, setLoading] = useState(false)

  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.name || !form.email || !form.message) {
      setStatus('error_empty')
      return
    }
    setLoading(true)
    setStatus(null)
    try {
      await emailjs.send(
        'service_laqfcvn',
        'template_irybq0f',
        { name: form.name, email: form.email, message: form.message },
        'lWz6Bj-KMIMAxsY43'
      )
      setStatus('success')
      setForm({ name:'', email:'', message:'' })
    } catch {
      setStatus('error')
    }
    setLoading(false)
  }

  return (
    <div className="card" style={{ marginTop:'0.5rem' }}>
      <p style={{ fontSize:'0.88rem', color:'var(--muted)', marginBottom:'1.25rem', lineHeight:1.6 }}>
        Masz pytanie lub problem? Napisz do nas — odpowiemy najszybciej jak to możliwe.
      </p>

      {status === 'success' && (
        <div style={{ background:'rgba(52,211,153,0.1)', border:'1px solid rgba(52,211,153,0.3)', borderRadius:'var(--r)', padding:'0.85rem 1rem', marginBottom:'1rem', fontSize:'0.88rem', color:'var(--success)' }}>
          ✓ Wiadomość wysłana! Odpowiemy najszybciej jak to możliwe.
        </div>
      )}
      {status === 'error_empty' && (
        <div style={{ background:'rgba(248,113,113,0.1)', border:'1px solid rgba(248,113,113,0.3)', borderRadius:'var(--r)', padding:'0.85rem 1rem', marginBottom:'1rem', fontSize:'0.88rem', color:'var(--danger)' }}>
          Wypełnij wszystkie pola formularza.
        </div>
      )}

      <div className="form-group">
        <label className="label">Imię i nazwisko</label>
        <input className="input" placeholder="Jan Kowalski" value={form.name} onChange={set('name')} />
      </div>
      <div className="form-group">
        <label className="label">Adres e-mail</label>
        <input className="input" type="email" placeholder="twoj@email.com" value={form.email} onChange={set('email')} />
      </div>
      <div className="form-group">
        <label className="label">Wiadomość</label>
        <textarea
          className="input"
          placeholder="Opisz swój problem lub pytanie..."
          value={form.message}
          onChange={set('message')}
          rows={5}
          style={{ resize:'vertical', minHeight:120, fontFamily:'var(--font)', lineHeight:1.6 }}
        />
      </div>
      <button className="btn" onClick={handleSubmit} disabled={loading} style={{ marginTop:'0.5rem' }}>
        {loading ? 'Wysyłanie...' : '✉️ Wyślij wiadomość'}
      </button>
      <p style={{ fontSize:'0.72rem', color:'var(--muted)', marginTop:'0.75rem', textAlign:'center' }}>
        Wiadomość zostanie wysłana na jumplogx@gmail.com
      </p>
    </div>
  )
}

export default function Manual() {
  return (
    <div>
      <Navbar />
      <div style={{ maxWidth: 720, margin: '0 auto', padding: '1.5rem 1rem 4rem' }}>

        <div style={{ textAlign: 'center', marginBottom: '2.5rem', padding: '2rem', background: 'var(--bg2)', border: '1px solid var(--border2)', borderRadius: 'var(--r2)', borderTop: '3px solid var(--accent)' }}>
          <div style={{ fontFamily: 'var(--head)', fontSize: '2rem', fontWeight: 900, marginBottom: '0.25rem' }}>
            <span style={{ color: '#A78BFA' }}>Jump</span><span style={{ color: 'var(--text)' }}>Log</span><span style={{ color: '#A78BFA' }}>X</span>
          </div>
          <div style={{ fontSize: '0.7rem', color: 'var(--muted)', marginBottom: '0.75rem' }}>by SkyQba ver 1.0</div>
          <div style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text)', marginBottom: '0.25rem' }}>Instrukcja użytkownika</div>
          <div style={{ fontSize: '0.82rem', color: 'var(--muted)' }}>Elektroniczny Dziennik Skoków Spadochronowych</div>
        </div>

        <div className="card" style={{ marginBottom: '2rem' }}>
          <div style={{ fontFamily: 'var(--head)', fontWeight: 800, marginBottom: '0.75rem', color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: 1, fontSize: '0.7rem' }}>Spis treści</div>
          {tocItems.map((item, i) => (
            <a key={i} href={`#${item.id}`} style={{ display: 'block', fontSize: '0.85rem', color: '#A78BFA', padding: '0.25rem 0', borderBottom: i < tocItems.length - 1 ? '1px solid var(--border)' : 'none', textDecoration: 'none', transition: 'opacity 0.15s' }}
              onMouseEnter={e => e.currentTarget.style.opacity = '0.7'}
              onMouseLeave={e => e.currentTarget.style.opacity = '1'}>
              {item.label}
            </a>
          ))}
        </div>

        <Section id="s1" title="1. Czym jest JumpLogX?">
          <P>JumpLogX to nowoczesna aplikacja webowa stworzona dla skoczków spadochronowych. Umożliwia prowadzenie elektronicznego dziennika skoków, przechowywanie dokumentów, zarządzanie sprzętem, eksport danych do PDF oraz śledzenie statystyk.</P>
          <P>Aplikacja działa w przeglądarce internetowej na każdym urządzeniu — komputerze, telefonie i tablecie, zarówno na iOS jak i Android. Dane są przechowywane w chmurze i dostępne z dowolnego miejsca na świecie.</P>
          <P>Aplikację można zainstalować na ekranie głównym telefonu jak natywną aplikację — działa wtedy również w trybie offline.</P>
        </Section>

        <Section id="s2" title="2. Pierwsze kroki">
          <Sub title="2.1 Rejestracja">
            <P>Aby korzystać z JumpLogX, musisz założyć bezpłatne konto:</P>
            <Ol items={[
              'Wejdź na adres aplikacji w przeglądarce',
              'Kliknij "Nie masz konta? Zarejestruj się"',
              'Wpisz imię, nazwisko, adres e-mail i hasło (min. 6 znaków)',
              'Kliknij "Utwórz konto"',
            ]} />
          </Sub>
          <Sub title="2.2 Logowanie">
            <Ol items={[
              'Wpisz swój adres e-mail i hasło',
              'Kliknij "Zaloguj się"',
            ]} />
            <P><strong style={{ color: 'var(--text)' }}>Zapomniałeś hasła?</strong> Kliknij "Zapomniałeś hasła?" i wpisz swój e-mail. Otrzymasz link do resetowania hasła.</P>
          </Sub>
        </Section>

        <Section id="s3" title="3. Dziennik skoków">
          <P>Dziennik to główna strona aplikacji. Widoczna jest tu lista wszystkich Twoich skoków posortowanych od najwyższego numeru.</P>
          <Sub title="3.1 Licznik skoków i szybkie akcje">
            <P>Na górze strony baner pokazuje Twój łączny numer skoku. Obok znajdziesz dwa przyciski:</P>
            <Ul items={[
              '"⟳ Powtórz ostatni" — dodaje nowy skok z takimi samymi danymi jak poprzedni (ta sama strefa, spadochron, samolot). Tylko data zmienia się na dzisiejszą.',
              '"+ Dodaj skok" — otwiera formularz nowego skoku',
            ]} />
          </Sub>
          <Sub title="3.2 Panel dokumentów">
            <P>Pod licznikiem skoków widoczny jest panel "Moje dokumenty" pokazujący status ważności Twoich dokumentów. Kliknij aby rozwinąć listę z datami ważności i kolorowym wskaźnikiem (zielony — ważny, żółty — wygasa wkrótce, czerwony — nieważny).</P>
          </Sub>
          <Sub title="3.3 Alerty i powiadomienia">
            <P>Aplikacja automatycznie wyświetla banery alertów gdy:</P>
            <Ul items={[
              'Zbliża się koniec ważności ułożenia spadochronu zapasowego (60 dni)',
              'Zbliża się koniec ważności ubezpieczenia lub badań lotniczych (60 dni)',
              'Wygasły uprawnienia lub dokumenty',
            ]} />
            <P>Alerty można zamknąć klikając "✕" — znikną do czasu wylogowania. Możesz zarządzać alertami w Ustawieniach.</P>
          </Sub>
          <Sub title="3.4 Wyszukiwanie">
            <P>Pod listą skoków znajduje się pole wyszukiwania. Możesz szukać po numerze, dacie, miejscowości, samolocie, spadochronie, rodzaju skoku, uwagach i wyniku.</P>
          </Sub>
          <Sub title="3.5 Szczegóły skoku">
            <P>Kliknij na kartę skoku aby zobaczyć wszystkie szczegóły — wysokość, opóźnienie, samolot, pogodę, wynik i uwagi. Z widoku szczegółów możesz również usunąć skok.</P>
          </Sub>
        </Section>

        <Section id="s4" title="4. Dodawanie nowego skoku">
          <P>Kliknij przycisk "+ Dodaj skok" na stronie głównej. Formularz zawiera następujące pola:</P>
          <FieldTable rows={[
            ['Numer skoku', 'Wypełnia się automatycznie jako kolejny numer. Możesz go zmienić ręcznie.'],
            ['Data skoku', 'Wybierz datę z kalendarza. Domyślnie dzisiejsza data.'],
            ['Rodzaj skoku', 'Tandem, AFF, SL, RW, FF, WS, CP, CF, ACC (Celność lądowania), B.A.S.E, Inny'],
            ['Miejscowość', 'Wybierz ze swojej listy stref zrzutu lub wpisz ręcznie'],
            ['Spadochron', 'Wybierz ze swojej listy sprzętu lub wpisz ręcznie'],
            ['Wysokość (m)', 'Wysokość skoku w metrach'],
            ['Opóźnienie (s)', 'Czas opóźnienia otwarcia w sekundach'],
            ['Samolot', 'Wpisz nazwę — aplikacja podpowiada z Twojej listy samolotów. Nowe samoloty są automatycznie zapisywane.'],
            ['Pogoda', 'Automatycznie pobierana na podstawie lokalizacji GPS (wymaga uprawnień). Można edytować ręcznie. Dostępna dla użytkowników Premium z uprawnieniem Pogoda.'],
            ['Wynik', 'Dostępne tylko dla skoku ACC (Celność lądowania). Wpisz wynik w cm.'],
            ['Uwagi', 'Dodatkowe notatki (maks. 150 znaków)'],
          ]} />
          <P>Po wypełnieniu pól kliknij "Zapisz skok".</P>
        </Section>

        <Section id="s5" title="5. Edycja zapisanych skoków">
          <P>Wejdź do Profilu i kliknij "✏ Edytuj skoki". Możesz:</P>
          <Ul items={[
            'Wyszukać skok po numerze, miejscowości, samolocie lub dacie',
            'Kliknąć na skok lub przycisk "✏ Edytuj" aby rozwinąć formularz',
            'Zmienić dowolne pole i zapisać zmiany',
            'Usunąć skok klikając "✕" na karcie skoku w dzienniku',
          ]} />
        </Section>

        <Section id="s6" title="6. Profil użytkownika i dokumenty">
          <P>W profilu zarządzasz swoimi danymi osobowymi, dokumentami, uprawnieniami i sprzętem.</P>
          <Sub title="6.1 Zdjęcie profilowe i dane osobowe">
            <P>Kliknij na avatar aby zmienić zdjęcie profilowe. Uzupełnij imię i nazwisko w sekcji Dane osobowe.</P>
          </Sub>
          <Sub title="6.2 Ubezpieczenie i badania lotnicze">
            <P>Wpisz daty ważności ubezpieczenia i badań lotniczych. Aplikacja wyświetli ostrzeżenie 60 dni przed wygaśnięciem.</P>
          </Sub>
          <Sub title="6.3 Komplety spadochronowe">
            <P>Dodaj zestawy spadochronowe podając nazwę, typ głównego i zapasowego, kontener, AAD oraz datę ważności ułożenia zapasowego. Aplikacja ostrzeże 60 dni przed wygaśnięciem.</P>
          </Sub>
          <Sub title="6.4 Uprawnienia i kwalifikacje">
            <P>W sekcji Kwalifikacje wpisz świadectwo kwalifikacji, klasę (PJ B/C/D), uprawnienia Tandem, INS/SL, INS/AFF, INS/T oraz licencję i uprawnienia USPA.</P>
          </Sub>
          <Sub title="6.5 Moje samoloty">
            <P>Zarządzaj listą samolotów dostępnych przy dodawaniu skoku. Możesz dodawać własne samoloty lub kliknąć "Szybkie dodawanie" aby dodać samoloty z listy domyślnej. Samoloty dodane przy wpisywaniu w formularzu skoku są automatycznie zapisywane.</P>
          </Sub>
          <Sub title="6.6 Strefy zrzutu">
            <P>Dodaj swoje ulubione strefy zrzutu — będą dostępne jako lista rozwijana przy dodawaniu skoku.</P>
          </Sub>
          <Sub title="6.7 Dokumenty spadochronowe">
            <P>Przechowuj skany dokumentów w aplikacji (PDF, JPG, PNG). Dokumenty są prywatne i dostępne tylko dla Ciebie. W trybie offline lista dokumentów jest widoczna, ale pobieranie wymaga połączenia z internetem.</P>
          </Sub>
        </Section>

        <Section id="s7" title="7. Eksport skoków">
          <P>Wejdź do Profilu i kliknij "Eksportuj skoki". Dostępne opcje: PDF, CSV i Druk.</P>
          <Sub title="7.1 Filtrowanie i sortowanie">
            <Ul items={[
              'Sortowanie według numeru, daty, wysokości lub opóźnienia',
              'Filtr daty od/do',
              'Filtr miejscowości, spadochronu, samolotu i typu skoku',
            ]} />
          </Sub>
          <Sub title="7.2 Zaznaczanie i eksport">
            <Ul items={[
              'Zaznacz wszystkie lub pojedyncze skoki',
              '"📄 Pobierz PDF" — plik A4 poziomy z tabelą skoków',
              '"📊 Pobierz CSV" — plik do Excela lub Numbers',
              '"🖨 Drukuj" — okno drukowania przeglądarki',
            ]} />
          </Sub>
        </Section>

        <Section id="s8" title="8. Import skoków z pliku">
          <P>Wejdź do Profilu i kliknij "Importuj skoki z CSV".</P>
          <Ol items={[
            'Przygotuj plik CSV (Excel: Zapisz jako CSV, Numbers: Eksportuj do CSV)',
            'Kliknij lub przeciągnij plik na pole importu',
            'Sprawdź podgląd pierwszych 8 skoków',
            'Kliknij "Importuj wszystkie X skoków"',
          ]} />
        </Section>

        <Section id="s9" title="9. Statystyki">
          <P>Statystyki dostępne są dla użytkowników Premium. Pokazują:</P>
          <Ul items={[
            'Łączna liczba skoków i dni od ostatniego skoku',
            'Czas swobodnego spadania (godziny, minuty, sekundy)',
            'Podział skoków według typu — wykres i liczby',
            'Najczęstsze strefy zrzutu i samoloty (z opcją "Pokaż wszystkie")',
            'Aktywność miesięczna i roczna — tabela i wykresy',
            'Wyniki ACC (Celność lądowania) — wykres postępu, najlepszy dzień, średnia',
            'Wysyłanie raportów miesięcznych na email',
            'Eksport statystyk do PDF',
          ]} />
        </Section>

        <Section id="s10" title="10. Ustawienia i powiadomienia">
          <Sub title="10.1 Motyw aplikacji">
            <P>Dostępny dla użytkowników Premium z uprawnieniem Motyw Pro. Wybierz między motywem Dark Mode (domyślny, ciemny z cyjanowymi akcentami) a Pro (fioletowy glassmorphism z wykresami na stronie głównej).</P>
          </Sub>
          <Sub title="10.2 Język">
            <P>Zmiana języka aplikacji (Polski / English) dostępna dla użytkowników Premium z uprawnieniem Język.</P>
          </Sub>
          <Sub title="10.3 Powiadomienia">
            <P>Włącz lub wyłącz alerty dla:</P>
            <Ul items={[
              'Ułożenia zapasowego',
              'Ubezpieczenia',
              'Badań lotniczych',
              'Świadectwa kwalifikacji',
              'Uprawnienia Tandem',
              'Uprawnień instruktorskich INS',
              'Licencji i uprawnień USPA',
            ]} />
          </Sub>
          <Sub title="10.4 Funkcje">
            <P>Włącz lub wyłącz dodatkowe funkcje (dostępne w zależności od uprawnień):</P>
            <Ul items={[
              'Pogoda przy dodawaniu skoku — automatyczne pobieranie warunków meteo na podstawie lokalizacji GPS',
            ]} />
          </Sub>
          <Sub title="10.5 Strefa niebezpieczna">
            <P>Opcja trwałego usunięcia konta wraz ze wszystkimi danymi. Przed usunięciem możesz pobrać kopię zapasową w formacie CSV lub PDF.</P>
          </Sub>
        </Section>

        <Section id="s11" title="11. Motywy aplikacji">
          <Sub title="11.1 Dark Mode (domyślny)">
            <P>Ciemny motyw z cyjanowymi akcentami. Ustawiony domyślnie dla wszystkich nowych użytkowników.</P>
            <Ul items={[
              'Głęboko ciemne tło z subtelnymi gradientami',
              'Cyjanowe akcenty i podświetlenia',
              'Glassmorphism — półprzezroczyste karty z efektem rozmycia tła',
              'Pływająca nawigacja z menu hamburgera na telefonie',
            ]} />
          </Sub>
          <Sub title="11.2 Pro Mode">
            <P>Zaawansowany wygląd z fioletowymi akcentami dostępny dla użytkowników Premium.</P>
            <Ul items={[
              'Fioletowo-niebieski gradient z efektem glassmorphism',
              'Pływająca nawigacja (Floating Island Navbar) z menu avatara',
              'Strona główna z wykresem aktywności (Sparkline) i liczbą skoków',
              'Karty skoków z pogodą widoczną bezpośrednio na liście',
              'Animowane wejście kart przy przewijaniu',
              'Przycisk FAB (+ Dodaj skok) z animacją pulsowania',
            ]} />
          </Sub>
          <Sub title="11.3 Włączanie motywu">
            <P>Wejdź w Ustawienia → sekcja "Motyw aplikacji" → wybierz "🌙 Dark Mode" lub "💎 Pro Mode". Motyw jest zapamiętywany między sesjami.</P>
          </Sub>
        </Section>

        <Section id="s12" title="12. Tryb offline">
          <P>JumpLogX działa również bez połączenia z internetem po wcześniejszym zainstalowaniu na ekranie głównym lub odwiedzeniu aplikacji online.</P>
          <Sub title="12.1 Co działa offline">
            <Ul items={[
              'Przeglądanie dziennika skoków',
              'Dodawanie nowych skoków (synchronizowane po powrocie do sieci)',
              'Przeglądanie profilu — dane osobowe, sprzęt, uprawnienia',
              'Lista dokumentów (pobieranie wymaga połączenia)',
              'Zdjęcie profilowe (cache lokalne)',
            ]} />
          </Sub>
          <Sub title="12.2 Informacja o trybie offline">
            <P>Przy braku połączenia pojawia się żółty baner "⚡ Tryb offline — zmiany zostaną zsynchronizowane po powrocie połączenia". Po przywróceniu połączenia dane są automatycznie synchronizowane z chmurą.</P>
          </Sub>
          <Sub title="12.3 Instalacja na ekranie głównym">
            <Ol items={[
              'iOS Safari: kliknij ikonę Udostępnij → "Dodaj do ekranu głównego"',
              'Android Chrome: kliknij menu (⋮) → "Dodaj do ekranu głównego"',
              'Po instalacji aplikacja działa jak natywna i obsługuje tryb offline',
            ]} />
          </Sub>
        </Section>

        <Section id="s13" title="13. Bezpieczeństwo i prywatność">
          <Ul items={[
            'Wszystkie dane są szyfrowane i przechowywane w chmurze (Supabase)',
            'Dokumenty są prywatne — dostępne tylko po zalogowaniu na Twoje konto',
            'Hasło jest szyfrowane i nieznane nikomu',
            'Możesz zresetować hasło w każdej chwili przez e-mail',
            'Dane innych użytkowników są dla Ciebie całkowicie niedostępne',
          ]} />
        </Section>

        <Section id="s14" title="14. Przydatne wskazówki">
          <Ul items={[
            'Zainstaluj JumpLogX na ekranie głównym telefonu aby mieć szybki dostęp i działanie offline',
            'Uzupełnij profil przed pierwszym skokiem — strefy zrzutu i sprzęt przyspieszą dodawanie skoków',
            'Użyj "⟳ Powtórz ostatni" gdy skaczysz kilka razy dziennie z tymi samymi ustawieniami',
            'Samoloty wpisane w formularzu skoku są automatycznie zapisywane do Twojej listy',
            'Skanuj dokumenty na bieżąco i przechowuj je w aplikacji jako backup',
            'Wynik ACC wpisz w cm — statystyki automatycznie pokażą Twój postęp',
            'Użyj filtrów w eksporcie aby wyeksportować tylko skoki z wybranego roku lub sprzętu',
            'Eksportuj PDF co sezon jako kopię zapasową dziennika',
            'W motyw Pro — kliknij avatar w prawym górnym rogu aby otworzyć menu z opcjami profilu i wylogowania',
          ]} />
        </Section>

        {/* REGULAMIN */}
        <Section id="s16" title="16. Regulamin">
          <P>Korzystając z aplikacji JumpLogX akceptujesz nasz Regulamin.</P>
          <P>Regulamin określa zasady korzystania z aplikacji, zakres odpowiedzialności Twórcy oraz obowiązki Użytkownika — w tym obowiązek tworzenia kopii zapasowych i prowadzenia papierowej książeczki skoków.</P>
          <div style={{ marginTop:'1rem' }}>
            <Link to="/terms" style={{ display:'inline-flex', alignItems:'center', gap:'0.5rem', background:'rgba(139,92,246,0.1)', border:'1px solid rgba(139,92,246,0.3)', borderRadius:'var(--r)', padding:'0.65rem 1.25rem', color:'#A78BFA', textDecoration:'none', fontWeight:600, fontSize:'0.88rem', transition:'all 0.2s' }}
              onMouseEnter={e => e.currentTarget.style.background='rgba(139,92,246,0.2)'}
              onMouseLeave={e => e.currentTarget.style.background='rgba(139,92,246,0.1)'}>
              📄 Przeczytaj Regulamin aplikacji JumpLogX
            </Link>
          </div>
        </Section>

        {/* FORMULARZ KONTAKTOWY */}
        <Section id="s15" title="15. Kontakt i pomoc">
          <ContactForm />
        </Section>

        <div style={{ textAlign: 'center', padding: '1.5rem', borderTop: '1px solid var(--border)', marginTop: '1rem' }}>
          <div style={{ fontFamily: 'var(--head)', fontSize: '1rem', fontWeight: 900, marginBottom: '0.25rem' }}>
            <span style={{ color: '#A78BFA' }}>Jump</span><span style={{ color: 'var(--text)' }}>Log</span><span style={{ color: '#A78BFA' }}>X</span>
            <span style={{ color: 'var(--muted)', fontWeight: 400, fontSize: '0.82rem' }}> by SkyQba</span>
          </div>
          <div style={{ fontSize: '0.72rem', color: 'var(--muted)' }}>Elektroniczny Dziennik Skoków Spadochronowych · ver 1.0</div>
        </div>

      </div>
    </div>
  )
}
