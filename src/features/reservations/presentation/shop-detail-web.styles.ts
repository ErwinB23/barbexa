export const shopDetailStyles = `
.bx-private .bx-detail-page,
.bx-detail-page {
  --sd-cream: #faf7f1;
  --sd-card: #fffdf9;
  --sd-border: #e8dccb;
  --sd-brown: #785020;
  --sd-muted: #756957;
  background: var(--sd-cream);
  color: #29231c;
  padding: 24px clamp(20px, 2.5vw, 42px) 36px !important;
  gap: 20px;
  font-family: Outfit, sans-serif;
  overflow: auto;
  min-width: 0;
}
.bx-detail-page * {
  box-sizing: border-box;
  min-width: 0;
}
.bx-detail-page h1,
.bx-detail-page h2,
.bx-detail-page h3,
.bx-detail-page p {
  margin: 0;
}
.bx-detail-page svg {
  width: 22px;
  height: 22px;
  flex-shrink: 0;
}
.bx-detail-page button,
.bx-detail-page a {
  font: inherit;
  font-size: 14px;
  line-height: 1.4;
}
.bx-detail-page button {
  cursor: pointer;
}
.bx-detail-page button:disabled {
  opacity: 0.55;
  cursor: default;
}
.bx-detail-page a:focus-visible,
.bx-detail-page button:focus-visible,
.bx-detail-page summary:focus-visible {
  outline: 3px solid #b78227;
  outline-offset: 4px;
}
.bx-detail-page p {
  line-height: 1.65;
  font-size: 14px;
  overflow-wrap: anywhere;
}
.bx-sd-back {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  align-self: flex-start;
  min-height: 44px;
  text-decoration: none;
  color: #725024;
  font-weight: 600;
}
.bx-sd-back > span {
  font-size: 23px;
}
.bx-sd-banner {
  position: relative;
  isolation: isolate;
  display: flex;
  align-items: center;
  gap: 26px;
  min-height: 225px;
  padding: 30px;
  border-radius: 20px;
  overflow: hidden;
  background: #21180f url("/images/login-barbershop-1920x1080.generated.jpg")
    center 51% / cover no-repeat;
  color: #fff9ef;
}
.bx-sd-banner:before {
  content: "";
  position: absolute;
  inset: 0;
  z-index: -1;
  background: linear-gradient(
    90deg,
    #140f0bf5 0%,
    #140f0bde 36%,
    #140f0b70 69%,
    #140f0b8f 100%
  );
}
.bx-sd-mark {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
  flex: 0 0 135px;
  min-height: 135px;
  padding: 15px;
  border: 2px solid #a67b3c;
  border-radius: 21px;
  background: #18130eb8;
  text-align: center;
  font-weight: 600;
  font-size: 16px;
  overflow-wrap: anywhere;
}
.bx-sd-mark svg {
  width: 40px;
  height: 40px;
  color: #e1bc78;
}
.bx-sd-banner-copy {
  padding-left: 24px;
  border-left: 1px solid #b5966155;
  flex: 1;
}
.bx-sd-banner h1 {
  font-size: clamp(28px, 2.5vw, 38px);
  line-height: 1.2;
  letter-spacing: -0.5px;
  overflow-wrap: anywhere;
}
.bx-sd-banner-copy > p {
  display: flex;
  align-items: flex-start;
  gap: 9px;
  margin: 16px 0 18px;
  max-width: 500px;
  color: #f0e5d6;
}
.bx-detail-page .bx-sd-primary {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 9px;
  min-height: 44px;
  padding: 13px 18px;
  border: 1px solid #a67a36;
  border-radius: 11px;
  color: #fff8ec;
  background: linear-gradient(120deg, #a77227, #74491b);
  box-shadow: 0 3px 10px #3f281516;
  text-decoration: none;
  font-weight: 600;
  white-space: normal;
}
.bx-sd-banner > .bx-sd-primary {
  align-self: flex-end;
  margin-bottom: 5px;
}
.bx-sd-illustrative {
  position: absolute;
  right: 17px;
  top: 12px;
  font-size: 10px;
  color: #f6e8d1;
  background: #17110ba8;
  padding: 4px 8px;
  border-radius: 5px;
}
.bx-sd-status {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  padding: 6px 11px;
  border-radius: 22px;
  background: #eee8dc;
  color: #6b5940;
  font-weight: 600;
  font-size: 11px;
  white-space: nowrap;
  line-height: 1.4;
}
.bx-sd-status > span {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: currentColor;
  flex-shrink: 0;
}
.bx-sd-status--open {
  background: #e3f0d8;
  color: #36652f;
}
.bx-sd-status--closed {
  background: #f2e8db;
  color: #735637;
}
.bx-sd-banner .bx-sd-status {
  font-size: 13px;
}
.bx-sd-layout {
  display: grid;
  grid-template-columns: minmax(0, 1.8fr) minmax(300px, 1fr);
  align-items: start;
  gap: 22px;
}
.bx-sd-main,
.bx-sd-sidebar {
  display: flex;
  flex-direction: column;
  gap: 20px;
  min-width: 0;
}
.bx-sd-card {
  background: var(--sd-card);
  border: 1px solid var(--sd-border);
  border-radius: 18px;
  padding: 20px;
  box-shadow: 0 5px 16px #68451b05;
}
.bx-sd-card > header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 18px;
  flex-wrap: wrap;
}
.bx-sd-card h2 {
  font-size: 20px;
  letter-spacing: -0.4px;
  font-weight: 700;
  line-height: 1.35;
  flex: 1;
}
.bx-sd-card h3 {
  font-size: 15px;
  line-height: 1.45;
  overflow-wrap: anywhere;
}
.bx-sd-icon {
  width: 39px;
  height: 39px;
  border-radius: 11px;
  background: #f8e7c5;
  color: #946626;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
.bx-sd-icon svg {
  width: 21px;
  height: 21px;
}
.bx-sd-empty {
  color: var(--sd-muted);
}
.bx-sd-services {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 12px;
}
.bx-sd-service {
  display: flex;
  flex-direction: column;
  border: 1px solid #eee5d8;
  border-radius: 13px;
  padding: 14px;
  background: linear-gradient(135deg, #fffdf9, #fcf7ee);
  overflow: hidden;
}
.bx-sd-service:only-child,
.bx-sd-professional:only-child {
  grid-column: 1 / -1;
}
.bx-sd-service > div {
  display: flex;
  align-items: flex-start;
  gap: 9px;
  flex: 1;
}
.bx-sd-service .bx-sd-icon {
  width: 32px;
  height: 32px;
}
.bx-sd-service p {
  font-size: 12px;
  color: var(--sd-muted);
  margin-top: 4px;
}
.bx-sd-service footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 10px;
  border-top: 1px solid #eee3d3;
  margin-top: 14px;
  padding-top: 11px;
  flex-wrap: wrap;
  font-size: 12px;
}
.bx-sd-service footer > span {
  display: flex;
  align-items: center;
  gap: 5px;
}
.bx-sd-service footer svg {
  width: 15px;
  height: 15px;
  color: #95692d;
}
.bx-sd-service footer strong {
  font-size: 14px;
}
.bx-detail-page .bx-sd-text-action {
  display: flex;
  align-items: center;
  gap: 7px;
  padding: 9px 11px;
  min-height: 40px;
  border: 0;
  border-radius: 9px;
  background: #fbefd8;
  color: #785323;
  font-size: 12px;
  font-weight: 500;
}
.bx-sd-text-action svg {
  width: 16px;
  height: 16px;
}
.bx-sd-professionals {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 14px;
}
.bx-sd-professional {
  display: flex;
  gap: 13px;
  align-items: flex-start;
  border-radius: 13px;
  padding: 12px;
  background: #fcf8f1;
  border: 1px solid #eee5d6;
}
.bx-sd-avatar {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 58px;
  height: 58px;
  border-radius: 50%;
  flex-shrink: 0;
  background: #f3e1c0;
  color: #936524;
}
.bx-sd-avatar svg {
  width: 31px;
  height: 31px;
}
.bx-sd-professional p {
  font-size: 12px;
  margin-top: 4px;
  color: var(--sd-muted);
}
.bx-sd-professional .bx-sd-primary {
  font-size: 12px;
  padding: 9px 16px;
  margin-top: 11px;
  min-height: 40px;
}
.bx-sd-reviews-empty {
  display: flex;
  align-items: center;
  gap: 17px;
  padding: 14px;
  border-radius: 12px;
  background: #fcf8f0;
  border: 1px dashed #e5d3b5;
}
.bx-sd-review-star {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 48px;
  height: 48px;
  flex-shrink: 0;
  background: #f9ebcf;
  border-radius: 50%;
  color: #aa7b2c;
}
.bx-sd-reviews-empty p {
  color: var(--sd-muted);
  margin-top: 4px;
  font-size: 13px;
}
.bx-sd-sidebar .bx-sd-card {
  padding: 19px;
}
.bx-sd-sidebar .bx-sd-card h2 {
  font-size: 17px;
}
.bx-sd-sidebar .bx-sd-card > header {
  display: grid;
  grid-template-columns: 39px minmax(0, 1fr);
  gap: 10px;
  margin-bottom: 13px;
}
.bx-sd-sidebar .bx-sd-status {
  grid-column: 2;
  justify-self: start;
  margin: 0;
}
.bx-sd-timezone {
  font-size: 11px !important;
  color: var(--sd-muted);
  margin-bottom: 12px !important;
}
.bx-sd-hours {
  margin: 0;
  font-size: 13px;
}
.bx-sd-hours > div {
  display: grid;
  grid-template-columns: 94px minmax(0, 1fr);
  gap: 12px;
  padding: 9px 0;
  border-bottom: 1px solid #f0e7da;
  align-items: start;
}
.bx-sd-hours > div:last-child {
  border-bottom: 0;
}
.bx-sd-hours dt {
  font-weight: 600;
  line-height: 1.55;
}
.bx-sd-hours dd {
  margin: 0;
  text-align: right;
  color: #6d5432;
  line-height: 1.55;
  display: flex;
  flex-direction: column;
  gap: 3px;
}
.bx-sd-hours dd span {
  white-space: nowrap;
}
.bx-sd-address {
  font-size: 14px;
  font-weight: 500;
}
.bx-sd-location {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  min-height: 86px;
  margin: 15px 0;
  background: repeating-linear-gradient(
    35deg,
    #f7f0e4,
    #f7f0e4 24px,
    #fdf9f1 24px,
    #fdf9f1 26px
  );
  border: 1px solid #eadcc5;
  border-radius: 12px;
  color: #8b6b3d;
  font-size: 12px;
}
.bx-sd-location svg {
  width: 29px;
  height: 29px;
}
.bx-detail-page .bx-sd-outline {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  text-decoration: none;
  border: 1px solid #dbc8a9;
  border-radius: 10px;
  min-height: 44px;
  padding: 10px;
  color: #805b29;
  font-size: 13px;
}
.bx-sd-caption {
  font-size: 11px !important;
  color: var(--sd-muted);
  margin-top: 9px !important;
}
.bx-sd-contact-number {
  font-size: 17px !important;
  font-weight: 600;
  margin: 6px 0 15px !important;
}
.bx-sd-contact-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 10px 20px;
}
.bx-sd-contact-actions a {
  display: flex;
  align-items: center;
  gap: 8px;
  min-height: 44px;
  font-size: 13px;
  color: #765123;
  text-decoration: none;
}
.bx-sd-contact-actions svg {
  width: 19px;
  height: 19px;
}
.bx-sd-notice {
  padding: 15px 18px;
  background: #f6e9d2;
  border: 1px solid #e3cc9f;
  border-radius: 12px;
  color: #74532a;
  font-size: 13px !important;
}
.bx-sd-state {
  padding: 22px;
  background: #fffdf9;
  border: 1px solid #e6d9c3;
  border-radius: 18px;
}
.bx-sd-state h1 {
  font-size: 24px;
  margin: 16px 0 9px;
}
.bx-sd-state p {
  color: var(--sd-muted);
}
.bx-sd-state button {
  min-height: 44px;
  margin-top: 18px;
  border-radius: 10px;
  background: #805424;
  color: #fff;
  border: 0;
  padding: 10px 20px;
}
.bx-sd-skeleton {
  height: 175px;
  border-radius: 13px;
  background: linear-gradient(115deg, #eddfc5, #f7f0e5);
}
@media (max-width: 1250px) {
  .bx-sd-layout {
    grid-template-columns: minmax(0, 1.4fr) minmax(290px, 1fr);
    gap: 18px;
  }
  .bx-sd-services {
    grid-template-columns: 1fr;
  }
  .bx-sd-service {
    padding: 14px;
  }
  .bx-sd-service footer {
    margin-top: 10px;
  }
  .bx-sd-professionals {
    grid-template-columns: 1fr;
  }
  .bx-sd-banner {
    flex-wrap: wrap;
    gap: 20px;
    padding: 25px;
  }
  .bx-sd-banner > .bx-sd-primary {
    margin-left: auto;
  }
  .bx-sd-mark {
    flex-basis: 110px;
    min-height: 110px;
  }
  .bx-sd-banner-copy {
    padding-left: 20px;
  }
}
@media (max-width: 950px) {
  .bx-sd-layout {
    grid-template-columns: 1fr;
  }
  .bx-sd-sidebar {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    align-items: start;
  }
  .bx-sd-services {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
  .bx-sd-professionals {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
  .bx-sd-mark {
    flex-basis: 100px;
    min-height: 110px;
  }
  .bx-sd-banner h1 {
    font-size: 28px;
  }
  .bx-sd-banner-copy {
    min-width: 220px;
  }
  .bx-detail-page .bx-sd-banner > .bx-sd-primary {
    width: 100%;
    margin: 0;
  }
}
@media (max-width: 600px) {
  .bx-private .bx-detail-page,
  .bx-detail-page {
    padding: 16px !important;
    gap: 16px;
  }
  .bx-sd-banner {
    padding: 24px 19px 20px;
    gap: 16px;
    border-radius: 16px;
  }
  .bx-sd-mark {
    flex-basis: 70px;
    min-height: 82px;
    padding: 9px;
    border-radius: 14px;
  }
  .bx-sd-mark svg {
    width: 32px;
    height: 32px;
  }
  .bx-sd-mark > span {
    display: none;
  }
  .bx-sd-banner-copy {
    min-width: 0;
    padding-left: 15px;
  }
  .bx-sd-banner h1 {
    font-size: 25px;
  }
  .bx-sd-banner-copy > p {
    font-size: 12px;
    margin: 12px 0;
  }
  .bx-sd-banner-copy .bx-sd-status {
    font-size: 11px;
  }
  .bx-sd-banner-copy > p svg {
    width: 17px;
    height: 17px;
  }
  .bx-sd-illustrative {
    top: 7px;
    font-size: 9px;
  }
  .bx-sd-services,
  .bx-sd-professionals,
  .bx-sd-sidebar {
    grid-template-columns: 1fr;
  }
  .bx-sd-card,
  .bx-sd-sidebar .bx-sd-card {
    padding: 17px;
    border-radius: 15px;
  }
  .bx-sd-card h2 {
    font-size: 18px;
  }
  .bx-sd-card > header {
    gap: 10px;
  }
  .bx-sd-professional {
    padding: 12px;
  }
  .bx-sd-hours > div {
    grid-template-columns: 100px minmax(0, 1fr);
  }
  .bx-sd-service > div {
    align-items: center;
  }
  .bx-sd-reviews-empty {
    align-items: flex-start;
  }
}
`;
