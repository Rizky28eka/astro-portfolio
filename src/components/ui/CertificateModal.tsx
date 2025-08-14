import { Show } from 'solid-js';

interface CertificateModalProps {
  isOpen: boolean;
  onClose: () => void;
  certificateUrl: string;
}

export default function CertificateModal(props: CertificateModalProps) {
  return (
    <Show when={props.isOpen}>
      <div
        class="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4"
        onClick={props.onClose} // Close when clicking outside the image
      >
        <div class="relative max-w-3xl max-h-full overflow-auto" onClick={(e) => e.stopPropagation()}> {/* Prevent modal from closing when clicking on the image */}
          <button
            onClick={props.onClose}
            class="absolute top-2 right-2 text-white text-3xl font-bold leading-none focus:outline-none"
            aria-label="Close modal"
          >
            &times;
          </button>
          {
            props.certificateUrl.endsWith('.pdf') ? (
              <iframe src={props.certificateUrl} class="w-[80vw] h-[80vh]" />
            ) : (
              <img src={props.certificateUrl} alt="Certificate" class="max-w-full max-h-[80vh] object-contain" />
            )
          }
        </div>
      </div>
    </Show>
  );
}
