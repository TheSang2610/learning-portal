"use client";

import { useState } from "react";

import SettingRow, {
  SettingCard,
} from "@/src/components/features/portal/user/settings/parts/SettingRow";
import {
  MAX_IMAGE_MB,
  ROLE_LABEL,
  ROLE_LABEL_DEFAULT,
  USER_SETTINGS,
} from "@/src/constants/portal/user-settings-page";
import { fmtDate, toDateInput } from "@/src/lib/date";
import type { Provider } from "@/src/services/userApi";
import type { SettingsTabProps } from "@/src/types/settings";

import { useAvatarPicker } from "../hooks/useAvatarPicker";
import styles from "../UserSettings.module.scss";
import AvatarField from "./AvatarField";
import FieldForm from "./FieldForm";

const P = USER_SETTINGS.personal;

interface PersonalTabProps extends SettingsTabProps {
  providers: Provider[];
  saveAvatarFile: (file: File) => Promise<boolean>;
}

/* ==========================================================================
   TAB: THONG TIN CA NHAN
   ========================================================================== */
export default function PersonalTab({
  user,
  providers,
  editing,
  toggle,
  saving,
  save,
  saveAvatarFile,
}: PersonalTabProps) {
  const [name, setName] = useState(user.name ?? "");
  const [fullname, setFullname] = useState(user.fullname ?? "");
  const [birthday, setBirthday] = useState(toDateInput(user.birthday));
  const [bio, setBio] = useState(user.bio ?? "");
  const [phone, setPhone] = useState(user.phone ?? "");
  const [email, setEmail] = useState("");
  const [providerId, setProviderId] = useState(
    typeof user.provider === "object" && user.provider
      ? user.provider._id
      : (user.provider ?? ""),
  );
  const image = useAvatarPicker(user.avatar ?? "");

  // Chon file thi day file len (multipart), khong thi luu duong dan (JSON).
  const saveAvatar = () =>
    image.pickedImage
      ? saveAvatarFile(image.pickedImage)
      : save({ avatar: image.avatar });

  const providerName =
    typeof user.provider === "object" && user.provider ? user.provider.name : "";

  return (
    <>
      <SettingCard title={P.basic.title} desc={P.basic.desc}>
        <SettingRow
          label={P.name.label}
          value={user.name}
          mono
          open={editing === "name"}
          onToggle={() => toggle("name")}
        >
          <FieldForm
            saving={saving}
            onSave={() => save({ name })}
            onCancel={() => toggle("name")}
            hint={P.name.hint}
          >
            <input
              className={styles.input2}
              value={name}
              maxLength={50}
              onChange={(e) => setName(e.target.value)}
              autoFocus
            />
          </FieldForm>
        </SettingRow>

        <SettingRow
          label={P.fullname.label}
          value={user.fullname}
          open={editing === "fullname"}
          onToggle={() => toggle("fullname")}
        >
          <FieldForm
            saving={saving}
            onSave={() => save({ fullname })}
            onCancel={() => toggle("fullname")}
            hint={P.fullname.hint}
          >
            <input
              className={styles.input2}
              value={fullname}
              maxLength={100}
              placeholder={P.fullname.placeholder}
              onChange={(e) => setFullname(e.target.value)}
              autoFocus
            />
          </FieldForm>
        </SettingRow>

        <SettingRow
          label={P.birthday.label}
          value={fmtDate(user.birthday)}
          open={editing === "birthday"}
          onToggle={() => toggle("birthday")}
        >
          <FieldForm
            saving={saving}
            onSave={() => save({ birthday })}
            onCancel={() => toggle("birthday")}
          >
            <input
              type="date"
              className={styles.input2}
              value={birthday}
              max={toDateInput(new Date().toISOString())}
              onChange={(e) => setBirthday(e.target.value)}
              autoFocus
            />
          </FieldForm>
        </SettingRow>

        <SettingRow
          label={P.bio.label}
          value={user.bio}
          open={editing === "bio"}
          onToggle={() => toggle("bio")}
        >
          <FieldForm
            saving={saving}
            onSave={() => save({ bio })}
            onCancel={() => toggle("bio")}
            hint={P.bio.hint(bio.length)}
          >
            <textarea
              className={`${styles.input2} ${styles.textarea}`}
              value={bio}
              maxLength={500}
              placeholder={P.bio.placeholder}
              onChange={(e) => setBio(e.target.value)}
              autoFocus
            />
          </FieldForm>
        </SettingRow>

        <SettingRow
          label={P.avatar.label}
          image={user.avatar ?? ""}
          open={editing === "avatar"}
          onToggle={() => toggle("avatar")}
        >
          <FieldForm
            saving={saving}
            saveLabel={image.pickedImage ? P.avatar.upload : USER_SETTINGS.form.save}
            onSave={saveAvatar}
            onCancel={() => toggle("avatar")}
            hint={P.avatar.hint(MAX_IMAGE_MB)}
          >
            <AvatarField p={image} />
          </FieldForm>
        </SettingRow>
      </SettingCard>

      <SettingCard title={P.contact.title} desc={P.contact.desc}>
        <SettingRow
          label={P.phone.label}
          value={user.phone}
          open={editing === "phone"}
          onToggle={() => toggle("phone")}
        >
          <FieldForm
            saving={saving}
            onSave={() => save({ phone })}
            onCancel={() => toggle("phone")}
            hint={P.phone.hint}
          >
            <input
              type="tel"
              inputMode="tel"
              className={styles.input2}
              value={phone}
              placeholder={P.phone.placeholder}
              onChange={(e) => setPhone(e.target.value)}
              autoFocus
            />
          </FieldForm>
        </SettingRow>

        {/* Email THEM DUOC MOT LAN khi tai khoan chua co, sau do khoa lai.
            Dang ky khong bat buoc email nua, nen ai bo trong luc do phai co
            duong bat lai kha nang tu lay lai mat khau. Con doi mot dia chi DA
            dat thi khong cho: doi email la doi luon cho nhan ma dat lai mat
            khau - xem ghi chu day du o updateUserProfile ben may chu. */}
        {user.email ? (
          <SettingRow
            label={P.email.label}
            value={user.email}
            mono
            readOnly
            hint={P.email.lockedHint}
          />
        ) : (
          <SettingRow
            label={P.email.label}
            value={undefined}
            mono
            open={editing === "email"}
            onToggle={() => toggle("email")}
          >
            <FieldForm
              saving={saving}
              onSave={() => save({ email })}
              onCancel={() => toggle("email")}
              hint={P.email.addHint}
            >
              <input
                type="email"
                className={styles.input2}
                value={email}
                placeholder={P.email.placeholder}
                onChange={(e) => setEmail(e.target.value)}
                autoFocus
              />
            </FieldForm>
          </SettingRow>
        )}

        {user.role === "instructor" && (
          <SettingRow
            label={P.provider.label}
            value={providerName}
            hint={P.provider.hint}
            open={editing === "provider"}
            onToggle={() => toggle("provider")}
          >
            <FieldForm
              saving={saving}
              onSave={() => save({ provider: providerId || null })}
              onCancel={() => toggle("provider")}
            >
              <select
                className={styles.input2}
                value={typeof providerId === "string" ? providerId : ""}
                onChange={(e) => setProviderId(e.target.value)}
                autoFocus
              >
                <option value="">{P.provider.none}</option>
                {providers.map((p) => (
                  <option key={p._id} value={p._id}>
                    {p.type === "university" ? P.provider.university : P.provider.company}
                    {p.name}
                  </option>
                ))}
              </select>
            </FieldForm>
          </SettingRow>
        )}
      </SettingCard>

      <SettingCard title={P.system.title}>
        <SettingRow label={P.system.userId} value={user.userId} mono readOnly />
        <SettingRow
          label={P.system.role}
          value={ROLE_LABEL[user.role] ?? ROLE_LABEL_DEFAULT}
          readOnly
        />
        <SettingRow label={P.system.joined} value={fmtDate(user.createdAt)} readOnly />
      </SettingCard>
    </>
  );
}
