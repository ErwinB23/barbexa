import { Platform, TextInput, View } from 'react-native';
import type { OperationApplication } from '../application/operation-application';
import { useProfessionalProfile } from './use-professional-profile';
import { ProfessionalProfileWeb } from './professional-profile-web';
import { AppButton } from '../../../shared/ui/app-button';
import { AppText } from '../../../shared/ui/app-text';
import { AppTextField } from '../../../shared/ui/app-text-field';
import { Section } from '../../../shared/ui/page-header';
import { tokens } from '../../../shared/ui/tokens';
export function ProfessionalProfilePanel({
  application,
  shopName,
}: {
  application: OperationApplication;
  shopName?: string;
}) {
  const p = useProfessionalProfile(application, shopName);
  if (Platform.OS === 'web') return <ProfessionalProfileWeb {...p} />;
  return (
    <Section title="Mi perfil profesional en esta barbería">
      {p.busy && (
        <AppText accessibilityLiveRegion="polite">
          Consultando mi perfil profesional…
        </AppText>
      )}
      {!!p.error && (
        <AppText tone="error" accessibilityLiveRegion="polite">
          {p.error}
        </AppText>
      )}
      {p.profile && (
        <>
          <AppText>
            {p.profile.barbershopName} · Profesional activo · Hora de Lima
          </AppText>
          {!p.extended && (
            <AppText>
              Puedes actualizar tu nombre. La descripción y las redes aún no
              están disponibles para guardar en este entorno.
            </AppText>
          )}
          <AppTextField
            id="self-professional-name"
            label="Mi nombre profesional"
            value={p.draft.professionalName}
            onChangeText={(v) => p.onChange('professionalName', v)}
            disabled={p.busy}
            hint="Este nombre pertenece solo a tu perfil de la barbería seleccionada."
          />
          <AppText>
            Descripción profesional · {Array.from(p.draft.description).length}
            /250
          </AppText>
          <TextInput
            accessibilityLabel="Descripción profesional"
            multiline
            editable={!p.busy && p.extended}
            value={p.draft.description}
            onChangeText={(v) =>
              p.onChange('description', Array.from(v).slice(0, 250).join(''))
            }
            style={{
              minHeight: 110,
              borderWidth: 1,
              borderColor: tokens.color.border,
              borderRadius: tokens.radius.control,
              padding: tokens.space.md,
              color: tokens.color.text,
            }}
          />
          {(['instagram', 'tiktok', 'facebook'] as const).map((key) => (
            <AppTextField
              key={key}
              id={`professional-${key}`}
              label={
                key === 'instagram'
                  ? 'Instagram'
                  : key === 'tiktok'
                    ? 'TikTok'
                    : 'Facebook'
              }
              value={p.draft[key] ?? ''}
              onChangeText={(v) => p.onChange(key, v)}
              disabled={p.busy || !p.extended}
            />
          ))}
          <AppButton
            label="Guardar mi perfil profesional"
            disabled={p.busy || !p.draft.professionalName.trim()}
            onPress={p.onSave}
          />
        </>
      )}
      <AppButton
        label="Consultar mi perfil profesional"
        variant="secondary"
        disabled={p.busy}
        onPress={p.onRead}
      />
      {p.saved && (
        <AppText tone="success" accessibilityLiveRegion="polite">
          {p.extended
            ? 'Perfil profesional actualizado.'
            : 'Nombre profesional actualizado.'}
        </AppText>
      )}
      {p.preview && p.profile && (
        <View>
          <AppText variant="heading">Vista previa del perfil guardado</AppText>
          <AppText>{p.profile.professionalName}</AppText>
          {p.extended && <AppText>{p.profile.description}</AppText>}
          {(['instagram', 'tiktok', 'facebook'] as const).map((k) =>
            p.extended && p.profile?.[k] ? (
              <AppText key={k}>
                {k}: {p.profile[k]}
              </AppText>
            ) : null,
          )}
        </View>
      )}
    </Section>
  );
}
