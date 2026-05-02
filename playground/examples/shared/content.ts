export type TContentLength = "short" | "medium" | "long";

const SNIPPETS: Record<TContentLength, string> = {
  short:
    "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Curabitur eget nisi a enim luctus efficitur.",
  medium:
    "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Curabitur eget nisi a enim luctus efficitur. " +
    "Phasellus pellentesque, lectus id sodales pretium, lacus tortor convallis nibh, eu venenatis arcu eros vitae nibh. " +
    "Donec vitae diam et nibh sagittis suscipit a non quam. Aliquam erat volutpat.",
  long:
    "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Curabitur eget nisi a enim luctus efficitur. " +
    "Phasellus pellentesque, lectus id sodales pretium, lacus tortor convallis nibh, eu venenatis arcu eros vitae nibh. " +
    "Donec vitae diam et nibh sagittis suscipit a non quam. Aliquam erat volutpat. " +
    "Sed ac libero in mauris pulvinar consequat. Suspendisse potenti. Nullam non purus a magna ullamcorper sodales. " +
    "Mauris pellentesque, sapien id rutrum euismod, eros lectus dictum erat, et tincidunt erat justo nec lacus. " +
    "Cras vitae nisl id risus aliquam pharetra. Etiam sit amet pretium tellus, in tristique tortor.",
};

export const getContent = (length: TContentLength = "medium"): string =>
  SNIPPETS[length];
