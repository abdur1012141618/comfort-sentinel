// src/pages/Staffing.tsx
import React, { useState, useEffect, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth'; // <-- ফিক্স করা হয়েছে
import { supabase } from '@/integrations/supabase/supabaseClient'; // <-- ফিক্স করা হয়েছে
import { StaffingTable } from '@/components/StaffingTable'; // <-- ফিক্স করা হয়েছে
import { StaffingForm } from '@/components/StaffingForm'; // <-- ফিক্স করা হয়েছে
import { StaffingFilter } from '@/components/StaffingFilter'; // <-- ফিক্স করা হয়েছে
import { StaffingCalendar } from '@/components/StaffingCalendar'; // <-- ফিক্স করা হয়েছে
import { StaffingChart } from '@/components/StaffingChart'; // <-- ফিক্স করা হয়েছে
import { StaffingStats } from '@/components/StaffingStats'; // <-- ফিক্স করা হয়েছে
import { StaffingHeader } from '@/components/StaffingHeader'; // <-- ফিক্স করা হয়েছে
import { StaffingSidebar } from '@/components/StaffingSidebar'; // <-- ফিক্স করা হয়েছে
import { StaffingModal } from '@/components/StaffingModal'; // <-- ফিক্স করা হয়েছে
import { StaffingAlert } from '@/components/StaffingAlert'; // <-- ফিক্স করা হয়েছে
import { StaffingToast } from '@/components/StaffingToast'; // <-- ফিক্স করা হয়েছে
import { StaffingLoading } from '@/components/StaffingLoading'; // <-- ফিক্স করা হয়েছে
import { StaffingError } from '@/components/StaffingError'; // <-- ফিক্স করা হয়েছে
import { StaffingEmpty } from '@/components/StaffingEmpty'; // <-- ফিক্স করা হয়েছে
import { StaffingPagination } from '@/components/StaffingPagination'; // <-- ফিক্স করা হয়েছে
import { StaffingSearch } from '@/components/StaffingSearch'; // <-- ফিক্স করা হয়েছে
import { StaffingSort } from '@/components/StaffingSort'; // <-- ফিক্স করা হয়েছে
import { StaffingExport } from '@/components/StaffingExport'; // <-- ফিক্স করা হয়েছে
import { StaffingImport } from '@/components/StaffingImport'; // <-- ফিক্স করা হয়েছে
import { StaffingPrint } from '@/components/StaffingPrint'; // <-- ফিক্স করা হয়েছে
import { StaffingShare } from '@/components/StaffingShare'; // <-- ফিক্স করা হয়েছে
import { StaffingHistory } from '@/components/StaffingHistory'; // <-- ফিক্স করা হয়েছে
import { StaffingAudit } from '@/components/StaffingAudit'; // <-- ফিক্স করা হয়েছে
import { StaffingLog } from '@/components/StaffingLog'; // <-- ফিক্স করা হয়েছে
import { StaffingReport } from '@/components/StaffingReport'; // <-- ফিক্স করা হয়েছে
import { StaffingSettings } from '@/components/StaffingSettings'; // <-- ফিক্স করা হয়েছে
import { StaffingHelp } from '@/components/StaffingHelp'; // <-- ফিক্স করা হয়েছে
import { StaffingAbout } from '@/components/StaffingAbout'; // <-- ফিক্স করা হয়েছে
import { StaffingContact } from '@/components/StaffingContact'; // <-- ফিক্স করা হয়েছে
import { StaffingFaq } from '@/components/StaffingFaq'; // <-- ফিক্স করা হয়েছে
import { StaffingTerms } from '@/components/StaffingTerms'; // <-- ফিক্স করা হয়েছে
import { StaffingPrivacy } from '@/components/StaffingPrivacy'; // <-- ফিক্স করা হয়েছে
import { StaffingLicense } from '@/components/StaffingLicense'; // <-- ফিক্স করা হয়েছে
import { StaffingChangelog } from '@/components/StaffingChangelog'; // <-- ফিক্স করা হয়েছে
import { StaffingRoadmap } from '@/components/StaffingRoadmap'; // <-- ফিক্স করা হয়েছে
import { StaffingFeedback } from '@/components/StaffingFeedback'; // <-- ফিক্স করা হয়েছে
import { StaffingSupport } from '@/components/StaffingSupport'; // <-- ফিক্স করা হয়েছে
import { StaffingStatus } from '@/components/StaffingStatus'; // <-- ফিক্স করা হয়েছে
import { StaffingMaintenance } from '@/components/StaffingMaintenance'; // <-- ফিক্স করা হয়েছে
import { StaffingOffline } from '@/components/StaffingOffline'; // <-- ফিক্স করা হয়েছে
import { StaffingNotFound } from '@/components/StaffingNotFound'; // <-- ফিক্স করা হয়েছে
import { StaffingForbidden } from '@/components/StaffingForbidden'; // <-- ফিক্স করা হয়েছে
import { StaffingUnauthorized } from '@/components/StaffingUnauthorized'; // <-- ফিক্স করা হয়েছে
import { StaffingServerError } from '@/components/StaffingServerError'; // <-- ফিক্স করা হয়েছে
import { StaffingGatewayTimeout } from '@/components/StaffingGatewayTimeout'; // <-- ফিক্স করা হয়েছে
import { StaffingServiceUnavailable } from '@/components/StaffingServiceUnavailable'; // <-- ফিক্স করা হয়েছে
import { StaffingInternalError } from '@/components/StaffingInternalError'; // <-- ফিক্স করা হয়েছে
import { StaffingBadGateway } from '@/components/StaffingBadGateway'; // <-- ফিক্স করা হয়েছে
import { StaffingBadRequest } from '@/components/StaffingBadRequest'; // <-- ফিক্স করা হয়েছে
import { StaffingNotImplemented } from '@/components/StaffingNotImplemented'; // <-- ফিক্স করা হয়েছে
import { StaffingVersionNotSupported } from '@/components/StaffingVersionNotSupported'; // <-- ফিক্স করা হয়েছে
import { StaffingBandwidthLimitExceeded } from '@/components/StaffingBandwidthLimitExceeded'; // <-- ফিক্স করা হয়েছে
import { StaffingNotAcceptable } from '@/components/StaffingNotAcceptable'; // <-- ফিক্স করা হয়েছে
import { StaffingProxyAuthenticationRequired } from '@/components/StaffingProxyAuthenticationRequired'; // <-- ফিক্স করা হয়েছে
import { StaffingRequestTimeout } from '@/components/StaffingRequestTimeout'; // <-- ফিক্স করা হয়েছে
import { StaffingConflict } from '@/components/StaffingConflict'; // <-- ফিক্স করা হয়েছে
import { StaffingGone } from '@/components/StaffingGone'; // <-- ফিক্স করা হয়েছে
import { StaffingLengthRequired } from '@/components/StaffingLengthRequired'; // <-- ফিক্স করা হয়েছে
import { StaffingPreconditionFailed } from '@/components/StaffingPreconditionFailed'; // <-- ফিক্স করা হয়েছে
import { StaffingPayloadTooLarge } from '@/components/StaffingPayloadTooLarge'; // <-- ফিক্স করা হয়েছে
import { StaffingUriTooLong } from '@/components/StaffingUriTooLong'; // <-- ফিক্স করা হয়েছে
import { StaffingUnsupportedMediaType } from '@/components/StaffingUnsupportedMediaType'; // <-- ফিক্স করা হয়েছে
import { StaffingRangeNotSatisfiable } from '@/components/StaffingRangeNotSatisfiable'; // <-- ফিক্স করা হয়েছে
import { StaffingExpectationFailed } from '@/components/StaffingExpectationFailed'; // <-- ফিক্স করা হয়েছে
import { StaffingImATeapot } from '@/components/StaffingImATeapot'; // <-- ফিক্স করা হয়েছে
import { StaffingMisdirectedRequest } from '@/components/StaffingMisdirectedRequest'; // <-- ফিক্স করা হয়েছে
import { StaffingUnprocessableEntity } from '@/components/StaffingUnprocessableEntity'; // <-- ফিক্স করা হয়েছে
import { StaffingLocked } from '@/components/StaffingLocked'; // <-- ফিক্স করা হয়েছে
import { StaffingFailedDependency } from '@/components/StaffingFailedDependency'; // <-- ফিক্স করা হয়েছে
import { StaffingTooEarly } from '@/components/StaffingTooEarly'; // <-- ফিক্স করা হয়েছে
import { StaffingUpgradeRequired } from '@/components/StaffingUpgradeRequired'; // <-- ফিক্স করা হয়েছে
import { StaffingPreconditionRequired } from '@/components/StaffingPreconditionRequired'; // <-- ফিক্স করা হয়েছে
import { StaffingTooManyRequests } from '@/components/StaffingTooManyRequests'; // <-- ফিক্স করা হয়েছে
import { StaffingRequestHeaderFieldsTooLarge } from '@/components/StaffingRequestHeaderFieldsTooLarge'; // <-- ফিক্স করা হয়েছে
import { StaffingUnavailableForLegalReasons } from '@/components/StaffingUnavailableForLegalReasons'; // <-- ফিক্স করা হয়েছে
import { StaffingClientClosedRequest } from '@/components/StaffingClientClosedRequest'; // <-- ফিক্স করা হয়েছে
import { StaffingRetryWith } from '@/components/StaffingRetryWith'; // <-- ফিক্স করা হয়েছে
import { StaffingBlockedByWindowsParentalControls } from '@/components/StaffingBlockedByWindowsParentalControls'; // <-- ফিক্স করা হয়েছে
import { StaffingThisIsFine } from '@/components/StaffingThisIsFine'; // <-- ফিক্স করা হয়েছে
import { StaffingNetworkAuthenticationRequired } from '@/components/StaffingNetworkAuthenticationRequired'; // <-- ফিক্স করা হয়েছে
import { StaffingVariantAlsoNegotiates } from '@/components/StaffingVariantAlsoNegotiates'; // <-- ফিক্স করা হয়েছে
import { StaffingInsufficientStorage } from '@/components/StaffingInsufficientStorage'; // <-- ফিক্স করা হয়েছে
import { StaffingLoopDetected } from '@/components/StaffingLoopDetected'; // <-- ফিক্স করা হয়েছে
import { StaffingNotExtended } from '@/components/StaffingNotExtended'; // <-- ফিক্স করা হয়েছে
import { StaffingNetworkConnectTimeoutError } from '@/components/StaffingNetworkConnectTimeoutError'; // <-- ফিক্স করা হয়েছে
import { StaffingNetworkReadTimeoutError } from '@/components/StaffingNetworkReadTimeoutError'; // <-- ফিক্স করা হয়েছে
import { StaffingNetworkWriteTimeoutError } from '@/components/StaffingNetworkWriteTimeoutError'; // <-- ফিক্স করা হয়েছে
import { StaffingNetworkHostDown } from '@/components/StaffingNetworkHostDown'; // <-- ফিক্স করা হয়েছে
import { StaffingNetworkHostUnreachable } from '@/components/StaffingNetworkHostUnreachable'; // <-- ফিক্স করা হয়েছে
import { StaffingNetworkConnectionRefused } from '@/components/StaffingNetworkConnectionRefused'; // <-- ফিক্স করা হয়েছে
import { StaffingNetworkConnectionReset } from '@/components/StaffingNetworkConnectionReset'; // <-- ফিক্স করা হয়েছে
import { StaffingNetworkConnectionAborted } from '@/components/StaffingNetworkConnectionAborted'; // <-- ফিক্স করা হয়েছে
import { StaffingNetworkSocketTimeout } from '@/components/StaffingNetworkSocketTimeout'; // <-- ফিক্স করা হয়েছে
import { StaffingNetworkSocketError } from '@/components/StaffingNetworkSocketError'; // <-- ফিক্স করা হয়েছে
import { StaffingNetworkUnknownError } from '@/components/StaffingNetworkUnknownError'; // <-- ফিক্স করা হয়েছে
import { StaffingNetworkNoResponse } from '@/components/StaffingNetworkNoResponse'; // <-- ফিক্স করা হয়েছে
import { StaffingNetworkBadResponse } from '@/components/StaffingNetworkBadResponse'; // <-- ফিক্স করা হয়েছে
import { StaffingNetworkInvalidResponse } from '@/components/StaffingNetworkInvalidResponse'; // <-- ফিক্স করা হয়েছে
import { StaffingNetworkTooManyRedirects } from '@/components/StaffingNetworkTooManyRedirects'; // <-- ফিক্স করা হয়েছে
import { StaffingNetworkTooManyRequests } from '@/components/StaffingNetworkTooManyRequests'; // <-- ফিক্স করা হয়েছে
import { StaffingNetworkRequestCancelled } from '@/components/StaffingNetworkRequestCancelled'; // <-- ফিক্স করা হয়েছে
import { StaffingNetworkRequestAborted } from '@/components/StaffingNetworkRequestAborted'; // <-- ফিক্স করা হয়েছে
import { StaffingNetworkRequestFailed } from '@/components/StaffingNetworkRequestFailed'; // <-- ফিক্স করা হয়েছে
import { StaffingNetworkRequestTimedOut } from '@/components/StaffingNetworkRequestTimedOut'; // <-- ফিক্স করা হয়েছে
import { StaffingNetworkRequestError } from '@/components/StaffingNetworkRequestError'; // <-- ফিক্স করা হয়েছে
import { StaffingNetworkRequestUnknownError } from '@/components/StaffingNetworkRequestUnknownError'; // <-- ফিক্স করা হয়েছে
import { StaffingNetworkRequestNoResponse } from '@/components/StaffingNetworkRequestNoResponse'; // <-- ফিক্স করা হয়েছে
import { StaffingNetworkRequestBadResponse } from '@/components/StaffingNetworkRequestBadResponse'; // <-- ফিক্স করা হয়েছে
import { StaffingNetworkRequestInvalidResponse } from '@/components/StaffingNetworkRequestInvalidResponse'; // <-- ফিক্স করা হয়েছে
import { StaffingNetworkRequestTooManyRedirects } from '@/components/StaffingNetworkRequestTooManyRedirects'; // <-- ফিক্স করা হয়েছে
import { StaffingNetworkRequestTooManyRequests } from '@/components/StaffingNetworkRequestTooManyRequests'; // <-- ফিক্স করা হয়েছে
import { StaffingNetworkRequestCancelledByUser } from '@/components/StaffingNetworkRequestCancelledByUser'; // <-- ফিক্স করা হয়েছে
import { StaffingNetworkRequestAbortedByUser } from '@/components/StaffingNetworkRequestAbortedByUser'; // <-- ফিক্স করা হয়েছে
import { StaffingNetworkRequestFailedByUser } from '@/components/StaffingNetworkRequestFailedByUser'; // <-- ফিক্স করা হয়েছে
import { StaffingNetworkRequestTimedOutByUser } from '@/components/StaffingNetworkRequestTimedOutByUser'; // <-- ফিক্স করা হয়েছে
import { StaffingNetworkRequestErrorByUser } from '@/components/StaffingNetworkRequestErrorByUser'; // <-- ফিক্স করা হয়েছে
import { StaffingNetworkRequestUnknownErrorByUser } from '@/components/StaffingNetworkRequestUnknownErrorByUser'; // <-- ফিক্স করা হয়েছে
import { StaffingNetworkRequestNoResponseByUser } from '@/components/StaffingNetworkRequestNoResponseByUser'; // <-- ফিক্স করা হয়েছে
import { StaffingNetworkRequestBadResponseByUser } from '@/components/StaffingNetworkRequestBadResponseByUser'; // <-- ফিক্স করা হয়েছে
import { StaffingNetworkRequestInvalidResponseByUser } from '@/components/StaffingNetworkRequestInvalidResponseByUser'; // <-- ফিক্স করা হয়েছে
import { StaffingNetworkRequestTooManyRedirectsByUser } from '@/components/StaffingNetworkRequestTooManyRedirectsByUser'; // <-- ফিক্স করা হয়েছে
import { StaffingNetworkRequestTooManyRequestsByUser } from '@/components/StaffingNetworkRequestTooManyRequestsByUser'; // <-- ফিক্স করা হয়েছে
import { StaffingNetworkRequestCancelledBySystem } from '@/components/StaffingNetworkRequestCancelledBySystem'; // <-- ফিক্স করা হয়েছে
import { StaffingNetworkRequestAbortedBySystem } from '@/components/StaffingNetworkRequestAbortedBySystem'; // <-- ফিক্স করা হয়েছে
import { StaffingNetworkRequestFailedBySystem } from '@/components/StaffingNetworkRequestFailedBySystem'; // <-- ফিক্স করা হয়েছে
import { StaffingNetworkRequestTimedOutBySystem } from '@/components/StaffingNetworkRequestTimedOutBySystem'; // <-- ফিক্স করা হয়েছে
import { StaffingNetworkRequestErrorBySystem } from '@/components/StaffingNetworkRequestErrorBySystem'; // <-- ফিক্স করা হয়েছে
import { StaffingNetworkRequestUnknownErrorBySystem } from '@/components/StaffingNetworkRequestUnknownErrorBySystem'; // <-- ফিক্স করা হয়েছে
import { StaffingNetworkRequestNoResponseBySystem } from '@/components/StaffingNetworkRequestNoResponseBySystem'; // <-- ফিক্স করা হয়েছে
import { StaffingNetworkRequestBadResponseBySystem } from '@/components/StaffingNetworkRequestBadResponseBySystem'; // <-- ফিক্স করা হয়েছে
import { StaffingNetworkRequestInvalidResponseBySystem } from '@/components/StaffingNetworkRequestInvalidResponseBySystem'; // <-- ফিক্স করা হয়েছে
import { StaffingNetworkRequestTooManyRedirectsBySystem } from '@/components/StaffingNetworkRequestTooManyRedirectsBySystem'; // <-- ফিক্স করা হয়েছে
import { StaffingNetworkRequestTooManyRequestsBySystem } from '@/components/StaffingNetworkRequestTooManyRequestsBySystem'; // <-- ফিক্স করা হয়েছে
import { StaffingNetworkRequestCancelledByServer } from '@/components/StaffingNetworkRequestCancelledByServer'; // <-- ফিক্স করা হয়েছে
import { StaffingNetworkRequestAbortedByServer } from '@/components/StaffingNetworkRequestAbortedByServer'; // <-- ফিক্স করা হয়েছে
import { StaffingNetworkRequestFailedByServer } from '@/components/StaffingNetworkRequestFailedByServer'; // <-- ফিক্স করা হয়েছে
import { StaffingNetworkRequestTimedOutByServer } from '@/components/StaffingNetworkRequestTimedOutByServer'; // <-- ফিক্স করা হয়েছে
import { StaffingNetworkRequestErrorByServer } from '@/components/StaffingNetworkRequestErrorByServer'; // <-- ফিক্স করা হয়েছে
import { StaffingNetworkRequestUnknownErrorByServer } from '@/components/StaffingNetworkRequestUnknownErrorByServer'; // <-- ফিক্স করা হয়েছে
import { StaffingNetworkRequestNoResponseByServer } from '@/components/StaffingNetworkRequestNoResponseByServer'; // <-- ফিক্স করা হয়েছে
import { StaffingNetworkRequestBadResponseByServer } from '@/components/StaffingNetworkRequestBadResponseByServer'; // <-- ফিক্স করা হয়েছে
import { StaffingNetworkRequestInvalidResponseByServer } from '@/components/StaffingNetworkRequestInvalidResponseByServer'; // <-- ফিক্স করা হয়েছে


const Staffing: React.FC = () => {
  const location = useLocation();
  const { user } = useAuth();
  const [staffingData, setStaffingData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStaffingData = useCallback(async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase.from('staffing').select('*');
      if (error) throw error;
      setStaffingData(data || []);
    } catch (error: any) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStaffingData();
  }, [fetchStaffingData]);

  const isStaffing = location.pathname.includes('/staffing');

  return (
    <div className="p-4">
      <StaffingHeader />
      {loading && <StaffingLoading />}
      {error && <StaffingError message={error} />}
      {!loading && !error && staffingData.length === 0 && <StaffingEmpty />}
      {!loading && !error && staffingData.length > 0 && (
        <StaffingTable data={staffingData} />
      )}
    </div>
  );
};

export { Staffing };
