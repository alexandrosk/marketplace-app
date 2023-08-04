import { Modal, Card, Button, VerticalStack } from '@shopify/polaris';
import {useEffect, useState} from 'react';
import {useMetafields} from "~/context/AppMetafields";

const OnboardingModal = () => {
  const [active, setActive] = useState(false);
  const [step, setStep] = useState(1);
  const { state, dispatch } = useMetafields();

  useEffect(
    () => {
      if (!state.onboarding) {
        setActive(true);
      }
    }, [state.onboarding])

  const handleChange = () => setActive(!active);

  const handleNextStep = () => setStep(step + 1);

  const handlePreviousStep = () => setStep(step - 1);

  const handleFinish = () => {
    setStep(1);
    handleChange();
    dispatch({type: 'SET_METAFIELDS', resourceId: 'onboarding', metafields: true});
  }

  return (
    <div style={{height: '500px'}}>
      <Modal
        open={active}
        onClose={handleChange}
        title="Onboarding"
        primaryAction={{
          content: 'Next',
          onAction: handleNextStep,
          disabled: step === 3
        }}
        secondaryActions={[
          {
            content: 'Previous',
            onAction: handlePreviousStep,
            disabled: step === 1
          }
        ]}
      >
        <Modal.Section>
          {step === 1 && (
            <Card >
              <p>Welcome to our application! Here's how to get started...</p>
            </Card>
          )}
          {step === 2 && (
            <Card >
              <p>Next, you'll need to set up your account...</p>
            </Card>
          )}
          {step === 3 && (
            <VerticalStack >
              <Card>
                <p>You're all set! Here's what you can do next...</p>
              </Card>
              <Button onClick={handleFinish}>Finish Onboarding</Button>
            </VerticalStack>
          )}
        </Modal.Section>
      </Modal>
    </div>
  );
};

export default OnboardingModal;
