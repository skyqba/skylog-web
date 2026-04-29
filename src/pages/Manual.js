import Navbar from '../components/Navbar'

const Section = ({ id, title, children }) => (
  <div id={id} style={{ marginBottom: '2rem', scrollMarginTop: '80px' }}>
    <h2 style={{ fontFamily: 'var(--head)', fontSize: '1.15rem', fontWeight: 800, color: 'var(--accent2)', marginBottom: '0.75rem', paddingBottom: '0.4rem', borderBottom: '1px solid var(--border)' }}>{title}</h2>
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
            <td style={{ padding: '0.5rem 0.75rem', fontWeight: 600, color: 'var(--accent2)', verticalAlign: 'top' }}>{label}</td>
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
  { label: '11. Tryb offline',                                    id: 's11' },
  { label: '12. Bezpieczeństwo i prywatność',                     id: 's12' },
  { label: '13. Przydatne wskazówki',                             id: 's13' },
]

export default function Manual() {
  return (
    <div>
      <Navbar />
      <div style={{ maxWidth: 720, margin: '0 auto', padding: '1.5rem 1rem 4rem' }}>

        {/* Nagłówek */}
        <div style={{ textAlign: 'center', marginBottom: '2.5rem', padding: '2rem', background: 'var(--bg2)', border: '1px solid var(--border2)', borderRadius: 'var(--r2)', borderTop: '3px solid var(--accent)' }}>
          <div style={{ fontFamily: 'var(--head)', fontSize: '2rem', fontWeight: 900, marginBottom: '0.25rem' }}>
            <span style={{ color: 'var(--accent2)' }}>Jump</span>Log<span style={{ color: 'var(--accent2)' }}>X</span>
          </div>
          <div style={{ fontSize: '0.7rem', color: 'var(--muted)', marginBottom: '0.75rem' }}>by SkyQba ver 1.0</div>
          <div style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text)', marginBottom: '0.25rem' }}>Instrukcja użytkownika</div>
          <div style={{ fontSize: '0.82rem', color: 'var(--muted)' }}>Elektroniczny Dziennik Skoków Spadochronowych</div>
        </div>

        {/* Spis treści */}
        <div className="card" style={{ marginBottom: '2rem' }}>
          <div style={{ fontFamily: 'var(--head)', fontWeight: 800, marginBottom: '0.75rem', color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: 1, fontSize: '0.7rem' }}>Spis treści</div>
          {tocItems.map((item, i) => (
            <a
              key={i}
              href={`#${item.id}`}
              style={{
                display: 'block',
                fontSize: '0.85rem',
                color: 'var(--accent2)',
                padding: '0.25rem 0',
                borderBottom: i < tocItems.length - 1 ? '1px solid var(--border)' : 'none',
                textDecoration: 'none',
                transition: 'opacity 0.15s',
              }}
              onMouseEnter={e => e.currentTarget.style.opacity = '0.7'}
              onMouseLeave={e => e.currentTarget.style.opacity = '1'}
            >
              {item.label}
            </a>
          ))}
        </div>

        {/* 1 */}
        <Section id="s1" title="1. Czym jest JumpLogX?">
          <P>JumpLogX to nowoczesna aplikacja webowa stworzona dla skoczków spadochronowych. Umożliwia prowadzenie elektronicznego dziennika skoków, przechowywanie dokumentów, zarządzanie sprzętem, eksport danych do PDF oraz śledzenie statystyk.</P>
          <P>Aplikacja działa w przeglądarce internetowej na każdym urządzeniu — komputerze, telefonie i tablecie, zarówno na iOS jak i Android. Dane są przechowywane w chmurze i dostępne z dowolnego miejsca na świecie.</P>
        </Section>

        {/* 2 */}
        <Section id="s2" title="2. Pierwsze kroki">
          <Sub title="2.1 Rejestracja">
            <P>Aby korzystać z JumpLogX, musisz założyć bezpłatne konto:</P>
            <Ol items={[
              'Wejdź na adres aplikacji w przeglądarce',
              'Kliknij "Nie masz konta? Zarejestruj się"',
              'Wpisz imię, nazwisko, adres e-mail i hasło (min. 6 znaków)',
              'Opcjonalnie dodaj zdjęcie profilowe (JPG lub PNG)',
              'Kliknij "Utwórz konto"',
            ]} />
          </Sub>
          <Sub title="2.2 Logowanie">
            <Ol items={[
              'Wpisz swój adres e-mail i hasło',
              'Opcjonalnie zaznacz "Zapamiętaj moje dane" aby nie logować się za każdym razem',
              'Kliknij "Zaloguj się"',
            ]} />
            <P><strong style={{ color: 'var(--text)' }}>Zapomniałeś hasła?</strong> Kliknij "Zapomniałeś hasła?" i wpisz swój e-mail. Otrzymasz link do resetowania hasła.</P>
          </Sub>
        </Section>

        {/* 3 */}
        <Section id="s3" title="3. Dziennik skoków">
          <P>Dziennik to główna strona aplikacji. Widoczna jest tu lista wszystkich Twoich skoków posortowanych od najwyższego numeru.</P>
          <Sub title="3.1 Licznik skoków i szybkie akcje">
            <P>Na górze strony baner pokazuje Twój łączny numer skoku. Obok znajdziesz dwa przyciski:</P>
            <Ul items={[
              '"⟳ Powtórz ostatni" — dodaje nowy skok z takimi samymi danymi jak poprzedni (ta sama strefa, spadochron, samolot). Tylko data zmienia się na dzisiejszą. Przydatne gdy skaczysz kilka razy dziennie z tymi samymi ustawieniami.',
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
            <P>Pod listą skoków znajduje się pole wyszukiwania. Możesz szukać po:</P>
            <Ul items={[
              'Numerze skoku (np. "4235")',
              'Dacie (np. "2024" lub "2024-06")',
              'Miejscowości (np. "Krasocin")',
              'Samolocie (np. "Cessna")',
              'Spadochronie (np. "Para Foil")',
              'Rodzaju skoku (np. "ACC")',
              'Uwagach i wyniku',
            ]} />
            <P>Kliknij "✕" aby wyczyścić wyszukiwanie.</P>
          </Sub>
        </Section>

        {/* 4 */}
        <Section id="s4" title="4. Dodawanie nowego skoku">
          <P>Kliknij przycisk "+ Dodaj skok" na stronie głównej. Formularz zawiera następujące pola:</P>
          <FieldTable rows={[
            ['Numer skoku', 'Wypełnia się automatycznie jako kolejny numer. Możesz go zmienić ręcznie.'],
            ['Data skoku', 'Wybierz datę z kalendarza'],
            ['Miejscowość', 'Wybierz ze swojej listy stref zrzutu lub wpisz ręcznie'],
            ['Spadochron', 'Wybierz ze swojej listy sprzętu lub wpisz ręcznie'],
            ['Rodzaj skoku', 'Tandem, AFF, SL, RW, FF, WS, CP, CF, ACC, B.A.S.E, Inny'],
            ['Wysokość (m)', 'Wysokość skoku w metrach'],
            ['Opóźnienie (s)', 'Czas opóźnienia otwarcia w sekundach'],
            ['Samolot', 'Typ samolotu lub śmigłowca'],
            ['Wynik', 'Np. "0.05", "1 miejsce", "zaliczony"'],
            ['Uwagi', 'Dodatkowe notatki'],
          ]} />
          <P>Po wypełnieniu pól kliknij "Zapisz skok".</P>
        </Section>

        {/* 5 */}
        <Section id="s5" title="5. Edycja zapisanych skoków">
          <P>Wejdź do Profilu i kliknij "✏ Edytuj skoki". Możesz:</P>
          <Ul items={[
            'Wyszukać skok po numerze, miejscowości, samolocie lub dacie',
            'Kliknąć na skok lub przycisk "✏ Edytuj" aby rozwinąć formularz',
            'Zmienić dowolne pole',
            'Zapisać zmiany przyciskiem "✓ Zapisz zmiany"',
            'Anulować edycję przyciskiem "Anuluj"',
          ]} />
          <P>Możesz również usunąć skok klikając "✕" na karcie skoku w dzienniku. Aplikacja poprosi o potwierdzenie przed usunięciem.</P>
        </Section>

        {/* 6 */}
        <Section id="s6" title="6. Profil użytkownika i dokumenty">
          <P>W profilu zarządzasz swoimi danymi osobowymi, dokumentami, uprawnieniami i sprzętem. Kliknij "Profil" w menu nawigacji.</P>
          <Sub title="6.1 Dane osobowe">
            <P>Uzupełnij imię, nazwisko, miejscowość, numer licencji i zdjęcie profilowe.</P>
          </Sub>
          <Sub title="6.2 Ubezpieczenie i badania lotnicze">
            <P>Wpisz daty ważności ubezpieczenia i badań lotniczych. Aplikacja wyświetli ostrzeżenie gdy termin będzie się zbliżał (60 dni wcześniej) lub gdy dokument wygaśnie.</P>
          </Sub>
          <Sub title="6.3 Sprzęt — spadochron zapasowy">
            <P>Dodaj swoje zestawy spadochronowe podając nazwę, datę ułożenia zapasowego i datę ważności. Aplikacja ostrzeże Cię 60 dni przed wygaśnięciem ułożenia.</P>
          </Sub>
          <Sub title="6.4 Uprawnienia i kwalifikacje">
            <P>W sekcji Kwalifikacje możesz wpisać:</P>
            <Ul items={[
              'Świadectwo kwalifikacji (numer i datę ważności)',
              'Uprawnienie Tandem',
              'Uprawnienia instruktorskie INS/SL, INS/AFF, INS/T',
              'Licencję USPA (klasa i numer)',
              'Uprawnienia USPA: Coach, Instructor, Examiner, Judge, PRO Rating',
            ]} />
          </Sub>
          <Sub title="6.5 Strefy zrzutu i sprzęt">
            <P>Dodaj swoje ulubione strefy zrzutu i spadochrony — będą dostępne jako lista rozwijana przy dodawaniu skoku, co przyspiesza wprowadzanie danych.</P>
          </Sub>
          <Sub title="6.6 Dokumenty">
            <P>Przechowuj skany dokumentów w aplikacji. Dokumenty są prywatne i dostępne tylko dla Ciebie. Obsługiwane formaty: PDF, JPG, PNG.</P>
            <Ul items={[
              'Licencja skoczka',
              'Polisa ubezpieczeniowa',
              'Orzeczenie lotniczo-lekarskie',
              'Świadectwo ułożenia spadochronu zapasowego',
            ]} />
          </Sub>
        </Section>

        {/* 7 */}
        <Section id="s7" title="7. Eksport skoków">
          <P>Wejdź do Profilu i kliknij "↓ Eksportuj skoki". Strona eksportu oferuje zaawansowane możliwości filtrowania i sortowania przed eksportem.</P>
          <Sub title="7.1 Filtrowanie i sortowanie">
            <P>Kliknij panel "🔍 Filtrowanie i sortowanie" aby go rozwinąć. Dostępne opcje:</P>
            <Ul items={[
              'Sortowanie według: numeru skoku, daty, wysokości lub opóźnienia (kliknij ponownie aby zmienić kierunek ↑↓)',
              'Filtr daty od/do — wpisz ręcznie w formacie RRRR-MM-DD (np. 2024-06-01)',
              'Filtr miejscowości — lista rozwijana z Twoich stref zrzutu',
              'Filtr spadochronu — lista rozwijana z Twojego sprzętu',
              'Filtr samolotu — lista rozwijana',
              'Filtr typu skoku — lista rozwijana',
            ]} />
            <P>Liczba aktywnych filtrów jest widoczna w nagłówku panelu. Kliknij "✕ Resetuj filtry" aby wyczyścić wszystkie filtry.</P>
          </Sub>
          <Sub title="7.2 Zaznaczanie skoków">
            <Ul items={[
              '"Zaznacz wszystkie" — zaznacza wszystkie przefiltrowane skoki',
              'Kliknij na wiersz lub checkbox aby zaznaczyć/odznaczyć pojedynczy skok',
              'Licznik pokazuje ile skoków jest zaznaczonych z ilu przefiltrowanych',
            ]} />
          </Sub>
          <Sub title="7.3 Eksport do PDF i druku">
            <Ul items={[
              '"📄 Pobierz PDF" — zapisuje plik PDF (format A4 poziomy) zawierający: imię i nazwisko skoczka, liczbę skoków, datę wydruku oraz tabelę z kolumnami: Lp., Nr skoku, Data, Miejscowość, Spadochron, Wysokość, Opóźnienie, Samolot, Typ skoku, Uwagi',
              '"🖨 Drukuj" — otwiera okno drukowania przeglądarki',
            ]} />
          </Sub>
        </Section>

        {/* 8 */}
        <Section id="s8" title="8. Import skoków z pliku">
          <P>Wejdź do Profilu i kliknij "↑ Importuj skoki z CSV".</P>
          <Sub title="8.1 Przygotowanie pliku">
            <Ul items={[
              'Excel: Plik → Zapisz jako → Tekst (rozdzielany tabulatorami) (*.txt)',
              'Numbers: Plik → Eksportuj do → CSV',
            ]} />
          </Sub>
          <Sub title="8.2 Przebieg importu">
            <Ol items={[
              'Kliknij lub przeciągnij plik na pole importu',
              'Sprawdź podgląd pierwszych 8 skoków',
              'Kliknij "Importuj wszystkie X skoków"',
              'Poczekaj na zakończenie',
            ]} />
          </Sub>
        </Section>

        {/* 9 */}
        <Section id="s9" title="9. Statystyki">
          <P>Strona Statystyki pokazuje podsumowanie Twojej działalności skokowej:</P>
          <Ul items={[
            'Łączna liczba skoków',
            'Podział skoków według typu (ACC, AFF, Tandem, FF itd.)',
            'Najczęściej używane strefy zrzutu i samoloty',
            'Aktywność skokowa w czasie — wykresy miesięczne i roczne',
            'Najczęściej używany sprzęt',
          ]} />
        </Section>

        {/* 10 */}
        <Section id="s10" title="10. Ustawienia i powiadomienia">
          <P>W Ustawieniach możesz włączyć lub wyłączyć powiadomienia dla:</P>
          <Ul items={[
            'Ułożenia zapasowego',
            'Ubezpieczenia',
            'Badań lotniczych',
            'Świadectwa kwalifikacji',
            'Uprawnienia Tandem',
            'Uprawnień instruktorskich INS',
          ]} />
          <P>Domyślnie wszystkie alerty są włączone. Wyłączone alerty nie będą wyświetlane na stronie głównej.</P>
        </Section>

        {/* 11 */}
        <Section id="s11" title="11. Tryb offline">
          <P>JumpLogX działa również bez połączenia z internetem:</P>
          <Ul items={[
            'Przy braku połączenia aplikacja wyświetla dane z ostatniej synchronizacji',
            'Informacja "⚡ Tryb offline" pojawia się na górze strony',
            'Po powrocie do sieci dane są automatycznie synchronizowane',
            'Operacje wykonane offline są kolejkowane i wysyłane po przywróceniu połączenia',
          ]} />
        </Section>

        {/* 12 */}
        <Section id="s12" title="12. Bezpieczeństwo i prywatność">
          <Ul items={[
            'Wszystkie dane są szyfrowane i przechowywane w chmurze',
            'Dokumenty są prywatne — dostępne tylko po zalogowaniu na Twoje konto',
            'Hasło jest szyfrowane i nieznane nikomu',
            'Możesz zresetować hasło w każdej chwili przez e-mail',
            'Dane innych użytkowników są dla Ciebie całkowicie niedostępne',
            'Opcja "Zapamiętaj moje dane" przechowuje dane logowania lokalnie na urządzeniu',
          ]} />
        </Section>

        {/* 13 */}
        <Section id="s13" title="13. Przydatne wskazówki">
          <Ul items={[
            'Dodaj JumpLogX do ekranu głównego telefonu aby mieć szybki dostęp jak do aplikacji natywnej',
            'Uzupełnij profil przed pierwszym skokiem — strefy zrzutu i sprzęt przyspieszą dodawanie skoków',
            'Użyj "⟳ Powtórz ostatni" gdy skaczysz kilka razy dziennie z tymi samymi ustawieniami',
            'Skanuj dokumenty na bieżąco i przechowuj je w aplikacji jako backup',
            'Użyj filtrów w eksporcie aby wyeksportować tylko skoki z wybranego roku lub na konkretnym sprzęcie',
            'Eksportuj PDF co sezon jako kopię zapasową dziennika',
            'Kolumny w tabeli eksportu są klikalne — kliknij nagłówek aby posortować',
            'Na telefonie użyj menu hamburgera (☰) aby przejść między sekcjami aplikacji',
          ]} />
        </Section>

        {/* Stopka */}
        <div style={{ textAlign: 'center', padding: '1.5rem', borderTop: '1px solid var(--border)', marginTop: '1rem' }}>
          <div style={{ fontFamily: 'var(--head)', fontSize: '1rem', fontWeight: 900, marginBottom: '0.25rem' }}>
            <span style={{ color: 'var(--accent2)' }}>Jump</span>Log<span style={{ color: 'var(--accent2)' }}>X</span>
            <span style={{ color: 'var(--muted)', fontWeight: 400, fontSize: '0.82rem' }}> by SkyQba</span>
          </div>
          <div style={{ fontSize: '0.72rem', color: 'var(--muted)' }}>Elektroniczny Dziennik Skoków Spadochronowych · ver 1.0</div>
        </div>

      </div>
    </div>
  )
}