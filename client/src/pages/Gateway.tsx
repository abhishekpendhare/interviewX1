import React from 'react';
import { AISaasHero } from '@/components/cinematic/AISaasHero';
import { AISaasQuickTiles } from '@/components/cinematic/AISaasQuickTiles';
import { AISaasDashboardShowcase } from '@/components/cinematic/AISaasDashboardShowcase';
import { AISaasDataStream } from '@/components/cinematic/AISaasDataStream';
import { AISaasFeaturesCarousel } from '@/components/cinematic/AISaasFeaturesCarousel';
import { AISaasWaveBand } from '@/components/cinematic/AISaasWaveBand';
import { NumberedContact } from '@/components/cinematic/NumberedContact';
export default function Gateway() {
  return (
    <div className="flex-1 bg-[#0B1020] text-white flex flex-col selection:bg-[#6D5CFF]/30 selection:text-white relative">

      {/* S2. Hero (ref-01): Neon X + Orbits + Photo Card + Floating Chat Bubbles + Slider */}
      <AISaasHero />

      {/* S3. Quick-Access Tiles (ref-01 bottom): 4 Glass Tiles with Active Underline */}
      <AISaasQuickTiles />

      {/* S5. Feature Dashboard Showcase (ref-03): Multi-layer Floating Mockups + Charts + Audio Waveform */}
      <AISaasDashboardShowcase />

      {/* S6. Data-Stream Transition (ref-04): Rising Vertical Circuit Traces */}
      <AISaasDataStream />

      {/* S7. Features Carousel (ref-05): 3D Glass Cards + Embedded Call Controls Bar */}
      <AISaasFeaturesCarousel />

      {/* S8. Wave and Particle Band (ref-06): Flowing Teal Light Ribbons */}
      <AISaasWaveBand />

      {/* S9. Direct Contact & Communication Channels */}
      <NumberedContact />
    </div>
  );
}
