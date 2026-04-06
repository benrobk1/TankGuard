'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useFetch } from '@/lib/hooks';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { LoadingSpinner } from '@/components/ui/loading';
import { CheckCircle, ChevronRight, Shield } from 'lucide-react';

const US_STATES = [
  'AL','AK','AZ','AR','CA','CO','CT','DE','DC','FL','GA','HI','ID','IL','IN','IA','KS','KY','LA','ME',
  'MD','MA','MI','MN','MS','MO','MT','NE','NV','NH','NJ','NM','NY','NC','ND','OH','OK','OR','PA','RI',
  'SC','SD','TN','TX','UT','VT','VA','WA','WV','WI','WY',
];

const productLabels: Record<string, string> = {
  REGULAR_GASOLINE: 'Regular Gasoline', PREMIUM_GASOLINE: 'Premium Gasoline',
  DIESEL: 'Diesel', KEROSENE: 'Kerosene', HEATING_OIL: 'Heating Oil', OTHER: 'Other',
};

const steps = [
  { num: 1, label: 'Welcome' },
  { num: 2, label: 'Facility' },
  { num: 3, label: 'Tanks' },
  { num: 4, label: 'Operators' },
  { num: 5, label: 'History' },
  { num: 6, label: 'Review' },
  { num: 7, label: 'Subscribe' },
];

export default function OnboardingPage() {
  const router = useRouter();
  const { data: states } = useFetch<Array<{ id: string; abbreviation: string; name: string }>>('/api/states');
  const [step, setStep] = useState(1);
  const [saving, setSaving] = useState(false);

  // Step 1: State selection
  const [selectedState, setSelectedState] = useState('');

  // Step 2: Facility info
  const [facility, setFacility] = useState({
    name: '', address: '', city: '', zip: '', stateId: '',
    registrationNumber: '', facilityType: 'GAS_STATION',
  });
  const [facilityId, setFacilityId] = useState('');

  // Step 3: Tanks
  const [tanks, setTanks] = useState([{
    tankNumber: 'T-1', capacityGallons: '10000', productStored: 'REGULAR_GASOLINE',
    material: 'FIBERGLASS', leakDetectionMethod: 'ATG',
    corrosionProtectionType: 'FIBERGLASS_NO_CP_NEEDED', dontKnowCP: false,
  }]);

  // Step 4: Operators
  const [operators, setOperators] = useState([{
    name: '', operatorClass: 'CLASS_A', certificationDate: '', notSure: false,
  }]);

  // Step 5: Last inspection dates
  const [neverTracked, setNeverTracked] = useState(false);

  // Step 6: Results
  const [complianceCount, setComplianceCount] = useState(0);
  const [overdueCount, setOverdueCount] = useState(0);

  useEffect(() => {
    if (selectedState && states) {
      const s = states.find(st => st.abbreviation === selectedState);
      if (s) setFacility(f => ({ ...f, stateId: s.id }));
    }
  }, [selectedState, states]);

  async function createFacility() {
    setSaving(true);
    try {
      const res = await fetch('/api/facilities', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(facility),
      });
      if (!res.ok) throw new Error('Failed');
      const data = await res.json();
      setFacilityId(data.id);
      setStep(3);
    } catch { alert('Failed to create facility'); }
    finally { setSaving(false); }
  }

  async function createTanks() {
    setSaving(true);
    try {
      for (const tank of tanks) {
        await fetch('/api/tanks', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            facilityId,
            tankNumber: tank.tankNumber,
            capacityGallons: parseInt(tank.capacityGallons),
            productStored: tank.productStored,
            material: tank.material,
            leakDetectionMethod: tank.leakDetectionMethod,
            corrosionProtectionType: tank.dontKnowCP ? undefined : tank.corrosionProtectionType,
            spillPreventionType: 'Spill bucket',
            overfillPreventionType: 'Ball float valve',
          }),
        });
      }
      setStep(4);
    } catch { alert('Failed to add tanks'); }
    finally { setSaving(false); }
  }

  async function createOperators() {
    setSaving(true);
    try {
      for (const op of operators) {
        if (!op.name) continue;
        await fetch('/api/operators', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            facilityId,
            name: op.name,
            operatorClass: op.operatorClass,
            certificationDate: op.notSure ? undefined : op.certificationDate || undefined,
          }),
        });
      }
      setStep(5);
    } catch { alert('Failed to add operators'); }
    finally { setSaving(false); }
  }

  async function generateSchedule() {
    setSaving(true);
    try {
      const res = await fetch('/api/compliance/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ facilityId }),
      });
      if (!res.ok) throw new Error('Failed');
      const data = await res.json();
      setComplianceCount(data.totalItems || 0);
      setOverdueCount(data.overdueItems || 0);
      setStep(6);
    } catch {
      setComplianceCount(0);
      setStep(6);
    }
    finally { setSaving(false); }
  }

  async function startCheckout() {
    setSaving(true);
    try {
      const res = await fetch('/api/stripe/checkout', { method: 'POST' });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        router.push('/dashboard');
      }
    } catch {
      router.push('/dashboard');
    } finally {
      setSaving(false);
    }
  }

  function addTank() {
    setTanks([...tanks, {
      tankNumber: `T-${tanks.length + 1}`, capacityGallons: '10000', productStored: 'REGULAR_GASOLINE',
      material: 'FIBERGLASS', leakDetectionMethod: 'ATG',
      corrosionProtectionType: 'FIBERGLASS_NO_CP_NEEDED', dontKnowCP: false,
    }]);
  }

  function addOperator() {
    setOperators([...operators, { name: '', operatorClass: 'CLASS_B', certificationDate: '', notSure: false }]);
  }

  function updateTank(index: number, field: string, value: string | boolean) {
    setTanks(tanks.map((t, i) => i === index ? { ...t, [field]: value } : t));
  }

  function updateOperator(index: number, field: string, value: string | boolean) {
    setOperators(operators.map((o, i) => i === index ? { ...o, [field]: value } : o));
  }

  return (
    <div className="max-w-2xl mx-auto py-8">
      {/* Progress */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-2">
          {steps.map((s) => (
            <div key={s.num} className="flex items-center">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                step > s.num ? 'bg-green-500 text-white' :
                step === s.num ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-500'
              }`}>
                {step > s.num ? <CheckCircle className="h-5 w-5" /> : s.num}
              </div>
              {s.num < 7 && <div className={`w-8 h-0.5 ${step > s.num ? 'bg-green-500' : 'bg-gray-200'}`} />}
            </div>
          ))}
        </div>
        <p className="text-sm text-gray-500 text-center">Step {step} of 7: {steps[step - 1].label}</p>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 p-6">
        {/* Step 1: Welcome */}
        {step === 1 && (
          <div className="space-y-6">
            <div className="text-center">
              <div className="flex justify-center mb-4">
                <div className="h-16 w-16 rounded-2xl bg-blue-600 flex items-center justify-center">
                  <Shield className="h-9 w-9 text-white" />
                </div>
              </div>
              <h2 className="text-2xl font-bold text-gray-900">Welcome to TankGuard</h2>
              <p className="text-gray-500 mt-2">Let&apos;s set up your compliance tracking. This takes about 5 minutes.</p>
            </div>

            <div>
              <Select label="What state are your tanks in?" value={selectedState} onChange={e => setSelectedState(e.target.value)}>
                <option value="">Select your state...</option>
                {US_STATES.map(s => <option key={s} value={s}>{s}</option>)}
              </Select>
            </div>

            <Button className="w-full" disabled={!selectedState} onClick={() => setStep(2)}>
              Continue <ChevronRight className="h-4 w-4 ml-2" />
            </Button>
          </div>
        )}

        {/* Step 2: Facility */}
        {step === 2 && (
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-gray-900">Add Your Facility</h2>
            <p className="text-sm text-gray-500">Enter your gas station or fueling facility details.</p>

            <Input label="Facility Name *" required value={facility.name} onChange={e => setFacility({ ...facility, name: e.target.value })} placeholder="e.g. Main Street Gas Station" />
            <Input label="Address *" required value={facility.address} onChange={e => setFacility({ ...facility, address: e.target.value })} />
            <div className="grid grid-cols-2 gap-4">
              <Input label="City *" required value={facility.city} onChange={e => setFacility({ ...facility, city: e.target.value })} />
              <Input label="ZIP Code *" required value={facility.zip} onChange={e => setFacility({ ...facility, zip: e.target.value })} />
            </div>
            <Input label="State Registration Number" value={facility.registrationNumber} onChange={e => setFacility({ ...facility, registrationNumber: e.target.value })} placeholder="Optional — helps auto-populate data" />

            <div className="flex gap-3 pt-2">
              <Button variant="secondary" onClick={() => setStep(1)}>Back</Button>
              <Button className="flex-1" onClick={createFacility} loading={saving} disabled={!facility.name || !facility.address || !facility.city || !facility.zip}>
                Continue <ChevronRight className="h-4 w-4 ml-2" />
              </Button>
            </div>
          </div>
        )}

        {/* Step 3: Tanks */}
        {step === 3 && (
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-gray-900">Add Your Tanks</h2>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm text-blue-800">
              Most gas stations have fiberglass tanks with ATG leak detection. We&apos;ve set smart defaults — adjust if your setup is different.
            </div>

            {tanks.map((tank, i) => (
              <div key={i} className="border border-gray-200 rounded-lg p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-medium text-gray-900">Tank {i + 1}</h3>
                  {tanks.length > 1 && (
                    <button onClick={() => setTanks(tanks.filter((_, j) => j !== i))} className="text-sm text-red-600 hover:text-red-800">Remove</button>
                  )}
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <Input label="Tank Number" value={tank.tankNumber} onChange={e => updateTank(i, 'tankNumber', e.target.value)} />
                  <Input label="Capacity (gallons)" type="number" value={tank.capacityGallons} onChange={e => updateTank(i, 'capacityGallons', e.target.value)} />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <Select label="Product Stored" value={tank.productStored} onChange={e => updateTank(i, 'productStored', e.target.value)}>
                    {Object.entries(productLabels).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                  </Select>
                  <Select label="Tank Material" value={tank.material} onChange={e => updateTank(i, 'material', e.target.value)}>
                    <option value="FIBERGLASS">Fiberglass</option>
                    <option value="STEEL">Steel</option>
                    <option value="DOUBLE_WALL_FIBERGLASS">Double-Wall Fiberglass</option>
                    <option value="DOUBLE_WALL_STEEL">Double-Wall Steel</option>
                    <option value="COMPOSITE">Composite</option>
                  </Select>
                </div>
                <Select label="Leak Detection Method" value={tank.leakDetectionMethod} onChange={e => updateTank(i, 'leakDetectionMethod', e.target.value)}>
                  <option value="ATG">Automatic Tank Gauge (ATG)</option>
                  <option value="SIR">Statistical Inventory Reconciliation (SIR)</option>
                  <option value="INTERSTITIAL_MONITORING">Interstitial Monitoring</option>
                  <option value="MANUAL_GAUGING">Manual Gauging</option>
                </Select>
                {!tank.dontKnowCP && (
                  <Select label="Corrosion Protection" value={tank.corrosionProtectionType} onChange={e => updateTank(i, 'corrosionProtectionType', e.target.value)}>
                    <option value="FIBERGLASS_NO_CP_NEEDED">Fiberglass (No CP Needed)</option>
                    <option value="CATHODIC_PROTECTION">Cathodic Protection</option>
                    <option value="INTERNAL_LINING">Internal Lining</option>
                    <option value="NONE">None / Unknown</option>
                  </Select>
                )}
                <label className="flex items-center gap-2 text-sm text-gray-600">
                  <input type="checkbox" checked={tank.dontKnowCP} onChange={e => updateTank(i, 'dontKnowCP', e.target.checked)} className="rounded border-gray-300" />
                  I don&apos;t know the corrosion protection type
                </label>
              </div>
            ))}

            <button onClick={addTank} className="w-full py-2 border-2 border-dashed border-gray-300 rounded-lg text-sm text-gray-500 hover:border-blue-300 hover:text-blue-600 transition-colors">
              + Add Another Tank
            </button>

            <div className="flex gap-3 pt-2">
              <Button variant="secondary" onClick={() => setStep(2)}>Back</Button>
              <Button className="flex-1" onClick={createTanks} loading={saving}>
                Continue <ChevronRight className="h-4 w-4 ml-2" />
              </Button>
            </div>
          </div>
        )}

        {/* Step 4: Operators */}
        {step === 4 && (
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-gray-900">Add Operators</h2>
            <p className="text-sm text-gray-500">EPA requires designated Class A, B, and C operators at each UST facility.</p>

            {operators.map((op, i) => (
              <div key={i} className="border border-gray-200 rounded-lg p-4 space-y-3">
                <Input label="Operator Name" value={op.name} onChange={e => updateOperator(i, 'name', e.target.value)} placeholder="Full name" />
                <Select label="Operator Class" value={op.operatorClass} onChange={e => updateOperator(i, 'operatorClass', e.target.value)}>
                  <option value="CLASS_A">Class A — Owner / Financial Control</option>
                  <option value="CLASS_B">Class B — Day-to-Day Operations</option>
                  <option value="CLASS_C">Class C — Front-Line Employee</option>
                </Select>
                {!op.notSure && (
                  <Input label="Last Training/Certification Date" type="date" value={op.certificationDate} onChange={e => updateOperator(i, 'certificationDate', e.target.value)} />
                )}
                <label className="flex items-center gap-2 text-sm text-gray-600">
                  <input type="checkbox" checked={op.notSure} onChange={e => updateOperator(i, 'notSure', e.target.checked)} className="rounded border-gray-300" />
                  I&apos;m not sure when I was last trained
                </label>
              </div>
            ))}

            <button onClick={addOperator} className="w-full py-2 border-2 border-dashed border-gray-300 rounded-lg text-sm text-gray-500 hover:border-blue-300 hover:text-blue-600 transition-colors">
              + Add Another Operator
            </button>

            <div className="flex gap-3 pt-2">
              <Button variant="secondary" onClick={() => setStep(3)}>Back</Button>
              <Button variant="secondary" onClick={() => setStep(5)}>Skip for now</Button>
              <Button className="flex-1" onClick={createOperators} loading={saving}>
                Continue <ChevronRight className="h-4 w-4 ml-2" />
              </Button>
            </div>
          </div>
        )}

        {/* Step 5: Inspection History */}
        {step === 5 && (
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-gray-900">Past Inspection History</h2>
            <p className="text-sm text-gray-500">Do you know when your tanks were last inspected? This helps us set accurate due dates.</p>

            <label className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
              <input type="radio" checked={neverTracked} onChange={() => setNeverTracked(true)} className="text-blue-600" />
              <div>
                <p className="font-medium text-gray-900">I&apos;ve never tracked this</p>
                <p className="text-sm text-gray-500">TankGuard will assume all items are due now or within 30 days</p>
              </div>
            </label>

            <label className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
              <input type="radio" checked={!neverTracked} onChange={() => setNeverTracked(false)} className="text-blue-600" />
              <div>
                <p className="font-medium text-gray-900">I have some records</p>
                <p className="text-sm text-gray-500">You can upload documentation after setup in the Document Vault</p>
              </div>
            </label>

            <div className="flex gap-3 pt-2">
              <Button variant="secondary" onClick={() => setStep(4)}>Back</Button>
              <Button className="flex-1" onClick={generateSchedule} loading={saving}>
                Generate My Schedule <ChevronRight className="h-4 w-4 ml-2" />
              </Button>
            </div>
          </div>
        )}

        {/* Step 6: Results */}
        {step === 6 && (
          <div className="space-y-6 text-center">
            <div className="flex justify-center">
              <div className="h-16 w-16 rounded-full bg-green-100 flex items-center justify-center">
                <CheckCircle className="h-9 w-9 text-green-600" />
              </div>
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Your Compliance Schedule is Ready</h2>
              <p className="text-gray-500 mt-2">Here&apos;s what TankGuard found for your facility:</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-blue-50 rounded-lg p-4">
                <p className="text-3xl font-bold text-blue-700">{complianceCount}</p>
                <p className="text-sm text-blue-600">Total Compliance Items</p>
              </div>
              <div className={`rounded-lg p-4 ${overdueCount > 0 ? 'bg-red-50' : 'bg-green-50'}`}>
                <p className={`text-3xl font-bold ${overdueCount > 0 ? 'text-red-700' : 'text-green-700'}`}>{overdueCount}</p>
                <p className={`text-sm ${overdueCount > 0 ? 'text-red-600' : 'text-green-600'}`}>{overdueCount > 0 ? 'Due Now or Overdue' : 'All Clear'}</p>
              </div>
            </div>

            {overdueCount > 0 && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-sm text-yellow-800">
                You have {overdueCount} compliance items that may need immediate attention. Subscribe to TankGuard to get full reminders and track all deadlines.
              </div>
            )}

            <div className="flex gap-3 pt-2">
              <Button variant="secondary" onClick={() => router.push('/dashboard')}>Go to Dashboard</Button>
              <Button className="flex-1" onClick={() => setStep(7)}>
                Subscribe — $99/month <ChevronRight className="h-4 w-4 ml-2" />
              </Button>
            </div>
          </div>
        )}

        {/* Step 7: Subscribe */}
        {step === 7 && (
          <div className="space-y-6 text-center">
            <h2 className="text-2xl font-bold text-gray-900">Start Your Subscription</h2>
            <p className="text-gray-500">$99/month &middot; Cancel anytime &middot; No setup fee</p>

            <div className="bg-gray-50 rounded-lg p-6 text-left">
              <h3 className="font-semibold text-gray-900 mb-3">Everything included:</h3>
              <ul className="space-y-2 text-sm text-gray-600">
                {['Unlimited facilities & tanks', 'All 50 states + federal EPA rules', 'Escalating email reminders', 'Document vault with unlimited storage', 'Audit-ready compliance reports', 'Compliance calendar', 'Weekly digest emails'].map(f => (
                  <li key={f} className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500 shrink-0" />{f}
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-sm text-green-800">
              <strong>Our Guarantee:</strong> If TankGuard misses a compliance deadline that results in a fine, we refund 12 months of subscription fees.
            </div>

            <div className="flex gap-3">
              <Button variant="secondary" onClick={() => router.push('/dashboard')}>Maybe Later</Button>
              <Button className="flex-1" onClick={startCheckout} loading={saving}>
                Subscribe Now — $99/month
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
