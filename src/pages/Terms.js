import { useLocation } from 'react-router-dom'

export default function Terms() {
  const { state } = useLocation()
  return (
    <div>
      <div style={{ maxWidth: 720, margin: '0 auto', padding: '1.5rem 1rem 4rem' }}>

        {/* Nagłówek */}
        <div style={{ textAlign: 'center', marginBottom: '2.5rem', padding: '2rem', background: 'var(--bg2)', border: '1px solid var(--border2)', borderRadius: 'var(--r2)', borderTop: '3px solid #8B5CF6' }}>
          <div style={{ fontFamily: 'var(--head)', fontSize: '2rem', fontWeight: 900, marginBottom: '0.25rem' }}>
            <span style={{ color: '#A78BFA' }}>Jump</span><span style={{ color: 'var(--text)' }}>Log</span><span style={{ color: '#A78BFA' }}>X</span>
          </div>
          <div style={{ fontSize: '0.7rem', color: 'var(--muted)', marginBottom: '0.75rem' }}>by SkyQba ver 1.0</div>
          <div style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text)', marginBottom: '0.25rem' }}>Regulamin aplikacji</div>
          <div style={{ fontSize: '0.82rem', color: 'var(--muted)' }}>Obowiązuje od 12 maja 2026</div>
        </div>

        {/* Sekcje */}
        <Section title="§1. Postanowienia ogólne">
          <P>Aplikacja JumpLogX (dalej: „Aplikacja") jest elektronicznym dziennikiem skoków spadochronowych, stworzonym przez SkyQba (dalej: „Twórca") i dostępnym pod adresem jumplogx.com.</P>
          <P>Korzystanie z Aplikacji oznacza akceptację niniejszego Regulaminu w całości. Jeśli nie zgadzasz się z jego treścią, prosimy o zaprzestanie korzystania z Aplikacji.</P>
          <P>Regulamin może być zmieniany w dowolnym czasie. O istotnych zmianach Użytkownicy będą informowani poprzez powiadomienie w Aplikacji.</P>
          <P urgent>© Wszelkie prawa do Aplikacji, w tym do jej nazwy, logotypu oraz kodu źródłowego, przysługują Twórcy. Nieautoryzowane kopiowanie, modyfikowanie lub rozpowszechnianie jakichkolwiek elementów Aplikacji jest zabronione.</P>
        </Section>

        <Section title="§2. Konto użytkownika i dane osobowe">
          <P>Korzystanie z pełnej funkcjonalności Aplikacji wymaga założenia bezpłatnego konta przy użyciu adresu e-mail i hasła. Podanie imienia i nazwiska nie jest wymagane podczas rejestracji.</P>
          <P>Imię i nazwisko można opcjonalnie uzupełnić w dowolnym momencie w sekcji Profil. Dane te są wykorzystywane wyłącznie do personalizacji raportów PDF generowanych przez Aplikację.</P>
          <P urgent>📄 Jeśli chcesz, aby Twoje imię i nazwisko widniało na wygenerowanym raporcie PDF, uzupełnij je w Profilu. W przeciwnym razie raport zostanie wygenerowany z samym adresem e-mail.</P>
          <P>Użytkownik jest zobowiązany do podania prawdziwych danych podczas rejestracji oraz do nieudostępniania danych logowania osobom trzecim.</P>
          <P>Twórca zastrzega sobie prawo do usunięcia konta, które narusza niniejszy Regulamin lub jest wykorzystywane w sposób niezgodny z przeznaczeniem Aplikacji.</P>
        </Section>

        <Section title="§3. Dane i kopie zapasowe">
          <P urgent>⚠️ Użytkownik jest zobowiązany do regularnego tworzenia kopii zapasowych swoich danych, w szczególności listy skoków.</P>
          <P>Aplikacja udostępnia funkcję eksportu danych do formatu CSV oraz PDF. Zalecamy korzystanie z tej funkcji regularnie — co najmniej raz na sezon skokowy.</P>
          <P urgent>⚠️ W maksymalnym zakresie dopuszczalnym przez obowiązujące prawo, Twórca nie ponosi odpowiedzialności za utratę danych, w tym utratę zapisanych skoków, niezależnie od przyczyny — w tym awarii serwera, błędów technicznych, problemów z dostawcą usług lub innych nieprzewidzianych okoliczności.</P>
          <P>Elektroniczny dziennik skoków w Aplikacji nie zastępuje oficjalnej, papierowej książeczki skoków.</P>
          <P urgent>📖 Każdy skoczek jest zobowiązany do prowadzenia papierowej książeczki skoków zgodnie z obowiązującymi przepisami lotniczymi. JumpLogX jest narzędziem pomocniczym i nie ma charakteru dokumentu urzędowego.</P>
          <P>W przypadku rozbieżności między danymi w Aplikacji a papierową książeczką skoków, za wiążące uznaje się dane zawarte w papierowej książeczce.</P>
        </Section>

        <Section title="§4. Ograniczenie odpowiedzialności">
          <P>Aplikacja jest udostępniana w stanie „takim, jaki jest" (as-is), bez jakichkolwiek gwarancji — wyraźnych ani dorozumianych.</P>
          <P>Twórca dołoży wszelkich starań, aby Aplikacja działała prawidłowo, była dostępna bez zakłóceń i zapewniała bezpieczne przechowywanie danych Użytkowników.</P>
          <P>Twórca nie gwarantuje jednak nieprzerwanego ani bezbłędnego działania Aplikacji, dostępności danych w każdym czasie, ani że dane wprowadzone przez Użytkownika nie zostaną utracone.</P>
          <P urgent>⚠️ W maksymalnym zakresie dopuszczalnym przez obowiązujące prawo, Twórca nie ponosi odpowiedzialności za jakiekolwiek szkody wynikłe z korzystania lub niemożności korzystania z Aplikacji, w tym utratę danych skoków, utratę dostępu do konta lub błędy w zapisanych danych.</P>
          <P>Użytkownik korzysta z Aplikacji na własne ryzyko i własną odpowiedzialność.</P>
        </Section>

        <Section title="§5. Dane osobowe i prywatność">
          <P>Aplikacja przechowuje dane podane przez Użytkownika podczas rejestracji oraz dane wprowadzone do dziennika skoków. Dane są przechowywane na serwerach dostawcy Supabase.</P>
          <P>Aplikacja wykorzystuje niezbędne pliki cookies oraz technologię lokalnego przechowywania danych (localStorage) w celu utrzymania sesji Użytkownika, zapamiętania preferencji i prawidłowego działania Aplikacji. Dane te nie są wykorzystywane w celach reklamowych ani śledzenia.</P>
          <P>Dane Użytkownika nie są udostępniane osobom trzecim w celach komercyjnych.</P>
          <P>Użytkownik ma prawo do wglądu, edycji oraz usunięcia swoich danych w dowolnym momencie poprzez opcję „Usuń konto" w Ustawieniach aplikacji.</P>
        </Section>

        <Section title="§6. Zasady korzystania">
          <P>Zabrania się wykorzystywania Aplikacji do celów niezgodnych z prawem, wprowadzania fałszywych danych skoków lub podszywania się pod inne osoby.</P>
          <P>Zabrania się podejmowania prób nieautoryzowanego dostępu do danych innych Użytkowników lub infrastruktury technicznej Aplikacji.</P>
        </Section>

        <Section title="§7. Dostępność i zmiany aplikacji">
          <P>Twórca zastrzega sobie prawo do modyfikacji, zawieszenia lub zakończenia działania Aplikacji w dowolnym czasie, bez wcześniejszego powiadomienia.</P>
          <P>W przypadku planowanego zakończenia działania Aplikacji, Twórca dołoży starań aby poinformować Użytkowników z odpowiednim wyprzedzeniem, umożliwiając eksport danych.</P>
        </Section>

        <Section title="§8. Kontakt">
          <P>W przypadku pytań dotyczących Regulaminu lub Aplikacji, prosimy o kontakt przez formularz dostępny w zakładce Pomoc lub bezpośrednio na adres: jumplogx@gmail.com</P>
        </Section>

        {/* Stopka */}
        <div style={{ textAlign: 'center', padding: '1.5rem', borderTop: '1px solid var(--border)', marginTop: '2rem' }}>
          <div style={{ fontFamily: 'var(--head)', fontSize: '1rem', fontWeight: 900, marginBottom: '0.25rem' }}>
            <span style={{ color: '#A78BFA' }}>Jump</span><span style={{ color: 'var(--text)' }}>Log</span><span style={{ color: '#A78BFA' }}>X</span>
            <span style={{ color: 'var(--muted)', fontWeight: 400, fontSize: '0.82rem' }}> by SkyQba</span>
          </div>
          <div style={{ fontSize: '0.72rem', color: 'var(--muted)' }}>Regulamin · Obowiązuje od 12 maja 2026</div>
        </div>

      </div>
    </div>
  )
}

function Section({ title, children }) {
  return (
    <div style={{ marginBottom: '2rem', scrollMarginTop: '80px' }}>
      <h2 style={{ fontFamily: 'var(--head)', fontSize: '1.1rem', fontWeight: 800, color: '#A78BFA', marginBottom: '0.75rem', paddingBottom: '0.4rem', borderBottom: '1px solid var(--border)' }}>{title}</h2>
      {children}
    </div>
  )
}

function P({ children, urgent }) {
  return (
    <p style={{
      fontSize: '0.88rem',
      color: urgent ? 'var(--text)' : 'var(--muted)',
      lineHeight: 1.7,
      marginBottom: '0.75rem',
      background: urgent ? 'rgba(139,92,246,0.06)' : 'transparent',
      border: urgent ? '1px solid rgba(139,92,246,0.2)' : 'none',
      borderLeft: urgent ? '3px solid #8B5CF6' : 'none',
      borderRadius: urgent ? '0 8px 8px 0' : 0,
      padding: urgent ? '0.65rem 0.85rem' : 0,
    }}>
      {children}
    </p>
  )
}
