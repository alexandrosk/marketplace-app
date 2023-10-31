import { Modal, Card, Button, InlineGrid } from "@shopify/polaris";
import { useEffect, useState } from "react";
import db from "../db.server";
import { updateSetting } from "~/models/settings.server";
import { useSettings } from "~/context/AppSettings";
import { settingsHook } from "../hooks/useSettings";

const OnboardingModal = () => {
  const [active, setActive] = useState(true);
  const [step, setStep] = useState(1);
  const { state, dispatch } = useSettings();
  const { updateSetting } = settingsHook();

  useEffect(() => {
    if (!state.settings?.onboarding_step) {
      setActive(true);
    }
  }, [state.setting?.onboarding_step]);

  const handleChange = () => setActive(!active);

  const handleNextStep = () => setStep(step + 1);

  const handlePreviousStep = () => setStep(step - 1);

  const handleFinish = async () => {
    setStep(1);
    handleChange();

    updateSetting("onboarding_step", 3);
    dispatch({ type: "SET_SETTING", resourceId: "onboarding_step", value: 3 });
  };

  return (
    <div style={{ height: "500px" }}>
      <Modal
        open={active}
        onClose={handleChange}
        title="Onboarding"
        primaryAction={{
          content: "Next",
          onAction: handleNextStep,
          disabled: step === 3,
        }}
        secondaryActions={[
          {
            content: "Previous",
            onAction: handlePreviousStep,
            disabled: step === 1,
          },
        ]}
      >
        <Modal.Section>
          {step === 1 && (
            <Card>
              <p>Welcome to our application! Here's how to get started...</p>
            </Card>
          )}
          {step === 2 && (
            <Card>
              <p>Next, you'll need to set up your account...</p>
            </Card>
          )}
          {step === 3 && (
            <InlineGrid>
              <Card>
                <p>You're all set! Here's what you can do next...</p>
              </Card>
              <Button onClick={handleFinish}>Finish Onboarding</Button>
            </InlineGrid>
          )}
        </Modal.Section>
      </Modal>
    </div>
  );
};

export default OnboardingModal;
