'use client';

import { useState } from 'react';
import { ChevronLeft, ChevronRight, ExternalLink, Globe, Puzzle, Smartphone, type LucideIcon } from 'lucide-react';
import { liveProjects, type LiveProject, type ProjectPlatform } from '@/data/live-projects';
import { Panel } from '@/components/panel';
import { Modal } from '@/components/modal';

const PLATFORM_ICON: Record<ProjectPlatform, LucideIcon> = {
  web: Globe,
  extension: Puzzle,
  app: Smartphone,
};

const PLATFORM_LABEL: Record<ProjectPlatform, string> = {
  web: 'Web app',
  extension: 'Chrome extension',
  app: 'Mobile app',
};

const PLATFORM_CTA: Record<ProjectPlatform, string> = {
  web: 'Visit site',
  extension: 'View on Chrome Web Store',
  app: 'View on Google Play',
};

// Web/extension screenshots are naturally landscape; app screenshots are
// portrait phone captures, which get badly cropped by a 16:9 box.
const PLATFORM_ASPECT: Record<ProjectPlatform, string> = {
  web: 'aspect-video',
  extension: 'aspect-video',
  app: 'aspect-[9/16]',
};

function ProjectThumbnail({ project }: { project: LiveProject }) {
  const Icon = PLATFORM_ICON[project.platform];

  if (project.cover) {
    return (
      <div className="aspect-video w-full overflow-hidden rounded-2xl bg-background transition-shadow group-hover:shadow-[0_8px_24px_rgb(0,0,0,0.1)]">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={project.cover} alt="" className="size-full object-cover transition-opacity group-hover:opacity-80" />
      </div>
    );
  }

  return (
    <div className="flex aspect-video w-full items-center justify-center rounded-2xl bg-linear-to-br from-accent/15 via-accent/5 to-transparent transition-shadow group-hover:shadow-[0_8px_24px_rgb(0,0,0,0.1)]">
      <div className="flex size-14 items-center justify-center rounded-2xl bg-surface shadow-[0_8px_24px_rgb(0,0,0,0.1)] transition-opacity group-hover:opacity-80">
        <Icon className="size-6 text-accent" />
      </div>
    </div>
  );
}

function CarouselDots({ count, index, onSelect }: { count: number; index: number; onSelect: (i: number) => void }) {
  if (count <= 1) return null;

  return (
    <div className="mt-3 flex justify-center gap-1.5">
      {Array.from({ length: count }, (_, i) => (
        <button
          key={i}
          type="button"
          onClick={() => onSelect(i)}
          aria-label={`Show image ${i + 1}`}
          className={`h-1.5 rounded-full transition-all ${i === index ? 'w-4 bg-accent' : 'w-1.5 bg-border'}`}
        />
      ))}
    </div>
  );
}

function ImageCarousel({ project }: { project: LiveProject }) {
  const [index, setIndex] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const { images } = project;

  if (images.length === 0) {
    return <ProjectThumbnail project={project} />;
  }

  const goPrev = () => setIndex((i) => (i - 1 + images.length) % images.length);
  const goNext = () => setIndex((i) => (i + 1) % images.length);

  // A full-width portrait box would tower over the rest of the modal, so
  // phone screenshots get a centered, phone-proportioned width instead.
  const containerWidth = project.platform === 'app' ? 'mx-auto max-w-[260px]' : 'w-full';

  return (
    <div>
      <div className={`relative ${PLATFORM_ASPECT[project.platform]} ${containerWidth} overflow-hidden rounded-2xl bg-background`}>
        <button type="button" onClick={() => setLightboxOpen(true)} aria-label="Enlarge image" className="block size-full cursor-zoom-in">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={images[index]} alt="" className="size-full object-cover" />
        </button>

        {images.length > 1 && (
          <>
            <button
              type="button"
              onClick={goPrev}
              aria-label="Previous image"
              className="absolute top-1/2 left-2 flex size-8 -translate-y-1/2 items-center justify-center rounded-full bg-surface/90 text-foreground shadow-[0_4px_12px_rgb(0,0,0,0.15)] transition-opacity hover:opacity-80"
            >
              <ChevronLeft className="size-4" />
            </button>
            <button
              type="button"
              onClick={goNext}
              aria-label="Next image"
              className="absolute top-1/2 right-2 flex size-8 -translate-y-1/2 items-center justify-center rounded-full bg-surface/90 text-foreground shadow-[0_4px_12px_rgb(0,0,0,0.15)] transition-opacity hover:opacity-80"
            >
              <ChevronRight className="size-4" />
            </button>
          </>
        )}
      </div>

      <CarouselDots count={images.length} index={index} onSelect={setIndex} />

      <Modal
        open={lightboxOpen}
        onClose={() => setLightboxOpen(false)}
        ariaLabel={`${project.title} screenshot ${index + 1}`}
        maxWidthClassName="max-w-4xl"
        zIndexClassName="z-110"
      >
        <div className="relative">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={images[index]} alt="" className="max-h-[75vh] w-full rounded-xl object-contain" />

          {images.length > 1 && (
            <>
              <button
                type="button"
                onClick={goPrev}
                aria-label="Previous image"
                className="absolute top-1/2 left-2 flex size-9 -translate-y-1/2 items-center justify-center rounded-full bg-surface/90 text-foreground shadow-[0_4px_12px_rgb(0,0,0,0.15)] transition-opacity hover:opacity-80"
              >
                <ChevronLeft className="size-5" />
              </button>
              <button
                type="button"
                onClick={goNext}
                aria-label="Next image"
                className="absolute top-1/2 right-2 flex size-9 -translate-y-1/2 items-center justify-center rounded-full bg-surface/90 text-foreground shadow-[0_4px_12px_rgb(0,0,0,0.15)] transition-opacity hover:opacity-80"
              >
                <ChevronRight className="size-5" />
              </button>
            </>
          )}
        </div>

        <CarouselDots count={images.length} index={index} onSelect={setIndex} />
      </Modal>
    </div>
  );
}

export function LiveProjectsRow() {
  const [selected, setSelected] = useState<LiveProject | null>(null);

  return (
    <Panel as="li">
      <h3 className="text-xl font-semibold text-foreground">Live Projects</h3>
      <p className="mt-1 text-muted">Shipped products you can try right now — a web app, a browser extension, and a mobile app.</p>

      <ul className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-3">
        {liveProjects.map((project) => (
          <li key={project.slug}>
            <button type="button" onClick={() => setSelected(project)} className="group block w-full text-left cursor-pointer">
              <ProjectThumbnail project={project} />
              <p className="mt-3 text-sm font-semibold text-foreground group-hover:text-accent">{project.title}</p>
              {project.tagline && <p className="mt-1 line-clamp-2 text-xs text-muted">{project.tagline}</p>}
              <span className="mt-2 inline-block rounded-full bg-accent/10 px-2.5 py-0.5 text-xs font-medium text-accent">
                {PLATFORM_LABEL[project.platform]}
              </span>
            </button>
          </li>
        ))}
      </ul>

      <Modal
        open={selected !== null}
        onClose={() => setSelected(null)}
        ariaLabel={selected ? selected.title : 'Project details'}
        maxWidthClassName="max-w-2xl"
      >
        {selected && (
          <div>
            <div className="flex items-center gap-3">
              <div className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-accent/10 text-accent">
                {(() => {
                  const Icon = PLATFORM_ICON[selected.platform];
                  return <Icon className="size-5" />;
                })()}
              </div>
              <div>
                <h4 className="text-xl font-semibold text-foreground">{selected.title}</h4>
                <p className="text-xs font-medium text-muted">{PLATFORM_LABEL[selected.platform]}</p>
              </div>
            </div>

            <div className="mt-5">
              <ImageCarousel key={selected.slug} project={selected} />
            </div>

            {selected.description && (
              <div className="mt-6">
                <p className="text-xs font-semibold tracking-wide text-muted uppercase">About</p>
                <p className="mt-2 leading-relaxed text-muted">{selected.description}</p>
              </div>
            )}

            {selected.technologies.length > 0 && (
              <div className={selected.description ? 'mt-6 border-t border-border pt-5' : 'mt-6'}>
                <p className="text-xs font-semibold tracking-wide text-muted uppercase">Built with</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {selected.technologies.map((tech) => (
                    <span key={tech} className="rounded-full bg-accent/10 px-2.5 py-0.5 text-xs font-medium text-accent">
                      {tech}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <a
              href={selected.url}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-6 inline-flex items-center gap-1.5 rounded-full bg-accent px-5 py-2.5 text-sm font-medium text-accent-foreground transition-opacity hover:opacity-90"
            >
              {PLATFORM_CTA[selected.platform]}
              <ExternalLink className="size-4" />
            </a>
          </div>
        )}
      </Modal>
    </Panel>
  );
}
