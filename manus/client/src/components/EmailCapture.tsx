import { useState } from "react";
import { Mail, CheckCircle, AlertCircle } from "lucide-react";
import { trpc } from "@/lib/trpc";

export function EmailCapture() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const subscribeMutation = trpc.subscription.subscribe.useMutation({
    onSuccess: (data) => {
      if (data.success) {
        setSubmitted(true);
        setEmail("");
        setError(null);
        setTimeout(() => setSubmitted(false), 5000);
      } else {
        setError(data.message);
      }
    },
    onError: (err) => {
      setError("Failed to subscribe. Please try again.");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      setError("Please enter your email");
      return;
    }
    subscribeMutation.mutate({ email });
  };

  return (
    <section className="section-padding bg-gradient-to-b from-background to-card/30">
      <div className="container">
        <div className="max-w-2xl mx-auto">
          <div className="glass-effect rounded-lg p-8 md:p-12">
            {/* Header */}
            <div className="mb-8">
              <h2 className="text-3xl md:text-4xl font-bold mb-3">
                Stay Updated
              </h2>
              <p className="text-muted-foreground">
                Get notified when new cases are confirmed. We'll send you updates directly to your inbox.
              </p>
            </div>

            {/* Form */}
            {submitted ? (
              <div className="flex items-center gap-3 p-4 bg-green-600/20 border border-green-600/50 rounded-lg">
                <CheckCircle className="text-green-500 flex-shrink-0" size={20} />
                <div>
                  <p className="font-semibold text-green-100">You're on the list!</p>
                  <p className="text-sm text-green-100/80">
                    Check your email for confirmation.
                  </p>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="flex flex-col sm:flex-row gap-3">
                  <div className="flex-1 relative">
                    <Mail className="absolute left-3 top-3.5 text-muted-foreground" size={18} />
                    <input
                      type="email"
                      placeholder="your@email.com"
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        setError(null);
                      }}
                      className="w-full pl-10 pr-4 py-3 bg-input border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent transition-all"
                      disabled={subscribeMutation.isPending}
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={subscribeMutation.isPending}
                    className="btn-primary whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {subscribeMutation.isPending ? "Subscribing..." : "Subscribe"}
                  </button>
                </div>

                {/* Error Message */}
                {error && (
                  <div className="flex items-center gap-2 p-3 bg-red-600/20 border border-red-600/50 rounded-lg text-red-100">
                    <AlertCircle size={16} className="flex-shrink-0" />
                    <p className="text-sm">{error}</p>
                  </div>
                )}

                {/* Privacy Notice */}
                <p className="text-xs text-muted-foreground">
                  We respect your privacy. Unsubscribe at any time.
                </p>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
