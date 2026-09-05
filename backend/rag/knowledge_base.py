from typing import List, Dict, Any

MOTOR_POLICY_KNOWLEDGE_BASE: List[Dict[str, Any]] = [
    {
        "clauseId": "POLICY-001",
        "title": "Accident Coverage",
        "policyText": "The insurer indemnifies the insured against sudden, unexpected, and accidental physical damage or loss to the insured motor vehicle and its standard factory-fitted accessories caused by accidental external violent collision, overturn, accidental fire, lightning, self-ignition, or malicious external impact during lawful operation on roadways.",
        "applicableClaimType": "Accident",
        "conditions": [
            "The loss must arise directly from accidental, external, and visible violent means rather than wear or mechanical fault.",
            "The driver at the wheel must hold an effective, unexpired driving license authorizing operation of the vehicle category.",
            "Damage scope claimed must correlate physically with the primary impact vector and speed of occurrence.",
            "No indemnification is payable for consequential mechanical breakdown occurring subsequent to the initial collision."
        ],
        "evidenceRequired": "Surveyor physical damage inspection report with high-resolution photographic evidence, claimant accident narrative detailing collision dynamics, and valid driving license credentials of the operating driver.",
        "category": "Coverage",
        "description": "The insurer indemnifies against sudden, unexpected, and accidental physical damage to the insured motor vehicle and its standard accessories caused by external violent collision, overturn, or fire.",
        "standardDeductionOrRule": "Subject to compulsory policy deductible and statutory material depreciation unless Zero-Depreciation add-on is active.",
        "appliesTo": "Both",
        "riskWeight": "HIGH"
    },
    {
        "clauseId": "POLICY-002",
        "title": "Theft Coverage",
        "policyText": "The policy covers total theft of the entire insured motor vehicle or total constructive loss resulting directly from theft, burglary, housebreaking, or criminal misappropriation, provided reasonable precautions were exercised by the insured to secure the vehicle against unauthorized removal.",
        "applicableClaimType": "Theft",
        "conditions": [
            "The insured must take all reasonable steps to safeguard the vehicle; leaving ignition keys inside an unattended or unlocked vehicle voids coverage under the reasonable care warranty.",
            "Immediate lodging of a formal Police First Information Report (FIR) within 24 hours of discovering the theft is mandatory.",
            "Both original factory ignition keys and the original Vehicle Registration Certificate (RC) must be surrendered to the insurer.",
            "Final indemnity settlement is conditional upon submission of a certified Police Final Non-Traceable / Untraced Report accepted by the judicial magistrate."
        ],
        "evidenceRequired": "Certified copy of Police FIR registered within 24 hours, surrender of both original ignition keys, original Vehicle Registration Certificate (RC), RTO non-objection certificate, and certified Final Police Untraced Report.",
        "category": "Theft",
        "description": "Covers total loss from theft or criminal burglary, provided immediate police reporting and key surrender conditions are satisfied.",
        "standardDeductionOrRule": "Settlement calculated at agreed Insured Declared Value (IDV) upon surrender of vehicle title and untraced certificate.",
        "appliesTo": "Both",
        "riskWeight": "HIGH"
    },
    {
        "clauseId": "POLICY-003",
        "title": "Exclusions",
        "policyText": "The insurer accepts no liability under this policy for: (a) consequential loss or consequential mechanical breakdown, specifically including engine hydrostatic lock caused by restarting or cranking in standing floodwater; (b) commercial carriage of goods, app-based courier delivery, or fare-paying passenger transit on private vehicle policies; (c) driving under the influence of intoxicating alcohol, liquor, or narcotics; (d) pre-existing damage, prior oxidation, body rust, or ordinary wear-and-tear; and (e) incidents occurring outside the defined geographical territory.",
        "applicableClaimType": "Both",
        "conditions": [
            "Any operation of a private passenger motor vehicle for commercial courier delivery, freight carriage, or ride-hailing triggers absolute claim repudiation.",
            "Internal engine damage (fractured connecting rods, cracked cylinder block) caused by cranking or restarting in standing water is deemed consequential negligence and excluded unless the Engine Protector rider is held.",
            "Blood alcohol concentration exceeding legal limits or clinical DUI citation in police records results in total claim denial.",
            "Pre-existing rust, prior panel weld oxidation, or wear scars unrelated to the claimed impact vector must be disallowed from workshop estimates."
        ],
        "evidenceRequired": "Customer statement on vehicle usage at time of loss, police sobriety / toxicology report (if applicable), mechanical inspection report on internal vs. external damage, and surveyor photographic records of rust or prior oxidation.",
        "category": "Exclusion",
        "description": "Strict exclusions governing consequential water-ingress engine damage, commercial carriage on private policies, intoxication, and pre-existing rust.",
        "standardDeductionOrRule": "Absolute exclusion. Any loss occurring under an excluded category results in disallowance or total claim repudiation.",
        "appliesTo": "Both",
        "riskWeight": "HIGH"
    },
    {
        "clauseId": "POLICY-004",
        "title": "Insured Value",
        "policyText": "The Insured Declared Value (IDV) established in the policy schedule represents the agreed value and maximum financial liability of the insurer in respect of total loss, constructive total loss (CTL), or theft. For partial losses, indemnity is assessed on authorized repair cost less statutory material depreciation (unless the Zero Depreciation rider is active) and the mandatory compulsory excess.",
        "applicableClaimType": "Both",
        "conditions": [
            "A claim is designated as Constructive Total Loss (CTL) when the aggregate cost of retrieval and repair exceeds 75% of the vehicle Insured Declared Value (IDV).",
            "A compulsory policy deductible applies to every claim: $1,000 / ₹1,000 for private cars; $100 / ₹100 for two-wheelers.",
            "In the absence of a Nil-Depreciation endorsement, statutory material depreciation applies: 50% on rubber/plastic/batteries, 30% on fiberglass, 0% on glass, and scaled rates (0% to 50%) on metal body panels.",
            "Salvage credit value must be credited back to the insurer on replaced metal or major assemblies."
        ],
        "evidenceRequired": "Policy Schedule verifying agreed IDV, itemized garage estimate distinguishing parts from labor, material composition classification, Zero-Depreciation endorsement certificate (if claimed), and compulsory deductible deduction statement.",
        "category": "Valuation",
        "description": "Defines Insured Declared Value (IDV), 75% CTL threshold, compulsory deductible scale, and statutory depreciation rates.",
        "standardDeductionOrRule": "Deduct $1,000 compulsory excess on car claims ($100 on 2W); apply statutory parts depreciation unless Nil-Dep rider is active.",
        "appliesTo": "Both",
        "riskWeight": "MEDIUM"
    },
    {
        "clauseId": "POLICY-005",
        "title": "Claim Notification Window",
        "policyText": "The claim must be reported within the defined policy period. Formal notification of any accidental collision, damage, or loss must be communicated to the insurer within 72 hours of occurrence (and within 24 hours for theft or burglary).",
        "applicableClaimType": "Both",
        "conditions": [
            "Accidental damage claims must be registered via digital portal, phone intimation, or written notice within 72 hours of the loss event.",
            "Theft claims must be formally intimated to both the jurisdictional police station and the insurer within 24 hours of discovery.",
            "No vehicle dismantling, repair, or disassembly shall commence before the company-appointed surveyor has performed an initial inspection.",
            "Delayed reporting past 72 hours requires verified documentary proof of emergency medical hospitalization or force majeure; unexplained delays may incur a non-standard penalty deduction (up to 25%) or claim rejection."
        ],
        "evidenceRequired": "Incident date and notification date. Specific verification of timestamp of occurrence, timestamp of claim intake registration, and corroborating hospitalization or breakdown dispatch timestamps if reporting was delayed.",
        "category": "Notification",
        "description": "Mandates 72-hour notice of accidental loss (24-hour notice for theft) and opportunity for pre-dismantling surveyor inspection.",
        "standardDeductionOrRule": "Notice required within 72 hours. Unjustified delay may trigger non-standard penalty deduction or rejection.",
        "appliesTo": "Both",
        "riskWeight": "MEDIUM"
    },
    {
        "clauseId": "POLICY-006",
        "title": "Required Documents",
        "policyText": "Every claim submission requires a complete dossier of authenticated statutory and contractual records to verify insurable interest, driver authorization, and factual loss authenticity before financial disbursement.",
        "applicableClaimType": "Both",
        "conditions": [
            "A fully completed and signed Claim Form containing contemporaneous incident details is mandatory for all claims.",
            "A government-issued Driver License of the person operating the vehicle at the exact time of loss, valid and unexpired for the vehicle class, must be presented.",
            "A valid Motor Vehicle Registration Certificate (RC) proving active insurable interest and ownership must be provided.",
            "An active Certificate of Insurance and Policy Schedule must be valid on the date and hour of loss."
        ],
        "evidenceRequired": "Completed and signed Claim Form, Government-issued Driver License valid at time of incident, official Vehicle Registration Certificate (RC), and active Policy Schedule with tax invoice.",
        "category": "Documentation",
        "description": "Statutory documentary dossier checklist: Signed Claim Form, Driver License, Registration Certificate (RC), and Insurance Policy Schedule.",
        "standardDeductionOrRule": "Claim processing suspended until all mandatory core documents are authenticated.",
        "appliesTo": "Both",
        "riskWeight": "HIGH"
    },
    {
        "clauseId": "POLICY-007",
        "title": "Repair Estimate Requirements",
        "policyText": "All claims for partial accidental damage must be supported by an itemized repair estimate issued by an authorized OEM dealership or certified repair facility, detailing individual spare parts, material composition, labor hours, paint codes, and distinguishing between repairable versus replaceable components.",
        "applicableClaimType": "Accident",
        "conditions": [
            "The estimate must itemize each part number, unit price, labor charge, and applicable taxes.",
            "The estimate must specify material category (Metal, Plastic, Glass, Rubber, Fibre Glass, Labour) for accurate depreciation computation.",
            "Major part replacements (chassis, engine sub-assembly, body shells) require prior written approval by the insurer appointed surveyor.",
            "Workshop intake date, odometer reading, and initial digital survey photographs must be documented before vehicle repair commences."
        ],
        "evidenceRequired": "Itemized workshop repair quotation on certified garage letterhead with GST/Tax ID, detailed parts vs. labor cost breakdown, material composition tags, workshop intake date, and pre-repair surveyor inspection photographs.",
        "category": "Repair Standards",
        "description": "Mandates itemized quotation with material classification (plastic, metal, glass) and surveyor pre-repair authorization.",
        "standardDeductionOrRule": "Unsubstantiated part replacements or parts lacking material classification will be assessed at surveyor-determined scale.",
        "appliesTo": "Both",
        "riskWeight": "MEDIUM"
    },
    {
        "clauseId": "POLICY-008",
        "title": "Theft/FIR Requirements",
        "policyText": "A certified copy of the Police First Information Report (FIR) registered at the local jurisdictional police station is strictly mandatory for all theft claims, fatal/injury accidents, malicious property damage, or hit-and-run collisions involving third parties.",
        "applicableClaimType": "Theft",
        "conditions": [
            "The FIR must be registered under appropriate criminal or penal code provisions within 24 hours of the incident.",
            "For theft claims, the FIR must explicitly cite vehicle registration number, engine number, chassis number, and circumstantial details.",
            "For hit-and-run or third-party injury claims, the FIR must document the investigating officer preliminary inspection notes and third-party particulars.",
            "For total theft, a final Police Untraced Report certified by a Judicial Magistrate must be furnished prior to financial indemnification."
        ],
        "evidenceRequired": "Certified true copy of Police FIR, Police Station daily diary entry extract, investigating officer badge number and contact details, and certified Final Non-Traceable Report.",
        "category": "Police & FIR",
        "description": "Mandatory Police FIR lodgment for all theft claims, third-party injuries, hit-and-run accidents, or malicious arson.",
        "standardDeductionOrRule": "Mandatory FIR prerequisite. Claim processing frozen until certified copy of police report is placed on record.",
        "appliesTo": "Both",
        "riskWeight": "HIGH"
    },
    {
        "clauseId": "POLICY-009",
        "title": "Zero Depreciation (Nil-Dep) Rider",
        "policyText": "Under this optional add-on endorsement, the insurer waives statutory depreciation deductions on plastic, rubber, nylon, fiberglass, and metal replacement parts damaged in an accidental collision covered under the policy.",
        "applicableClaimType": "Accident",
        "conditions": [
            "Applies only to vehicles not exceeding 5 years of manufacturing vintage.",
            "Limited to a maximum of two approved accidental damage claims per annual policy period.",
            "Compulsory policy excess ($1,000 on cars; $100 on 2W) remains applicable.",
            "Requires verified active endorsement on the policy schedule."
        ],
        "evidenceRequired": "Active Zero Depreciation endorsement schedule certificate and itemized parts invoice from authorized workshop.",
        "category": "Add-on Cover",
        "description": "Waives 50% plastic/rubber and scaled metal depreciation on accidental replacement parts.",
        "standardDeductionOrRule": "100% parts reimbursement (excluding compulsory deductible and salvage credit).",
        "appliesTo": "Both",
        "riskWeight": "LOW"
    },
    {
        "clauseId": "POLICY-010",
        "title": "Engine Protector & Hydrostatic Lock Rider",
        "policyText": "Extends accidental damage indemnity to internal engine components, connecting rods, cylinder block, gearbox internals, and differential assemblies damaged due to hydrostatic lock, water ingress from standing floodwater, or lubricating oil leakage following an underbody collision.",
        "applicableClaimType": "Accident",
        "conditions": [
            "Requires documented proof of severe water ingress or road debris impact puncturing oil sump / oil cooler.",
            "Must be purchased as a specific endorsement rider prior to loss occurrence.",
            "Covers internal engine overhaul labor and replacement of fractured connecting rods and pistons."
        ],
        "evidenceRequired": "Engine Protector endorsement certificate, workshop diagnostic report on internal piston/rod condition, and surveyor verification.",
        "category": "Add-on Cover",
        "description": "Overcomes POLICY-003 hydrostatic lock exclusion by covering internal engine mechanical components damaged by flood water.",
        "standardDeductionOrRule": "Reimburses internal engine rebuild costs otherwise excluded under standard policy consequential loss rules.",
        "appliesTo": "Both",
        "riskWeight": "HIGH"
    },
    {
        "clauseId": "POLICY-011",
        "title": "Consumables Expense Rider",
        "policyText": "Reimburses the cost of non-reusable consumable materials necessary to complete accidental repairs, including engine oil, gearbox oil, brake fluid, coolant, AC refrigerant gas, washers, and specialized adhesives.",
        "applicableClaimType": "Accident",
        "conditions": [
            "Payable only when associated with an authorized, covered accidental repair under the policy.",
            "Maximum reimbursement capped at workshop invoice quantities."
        ],
        "evidenceRequired": "Consumables endorsement certificate and workshop tax invoice itemizing fluid volumes and consumables.",
        "category": "Add-on Cover",
        "description": "Reimburses oils, coolants, and specialized fasteners replaced during collision repairs.",
        "standardDeductionOrRule": "100% payable when add-on is active; otherwise strictly excluded from basic OD settlement.",
        "appliesTo": "Both",
        "riskWeight": "LOW"
    },
    {
        "clauseId": "POLICY-012",
        "title": "Return to Invoice (RTI) Rider",
        "policyText": "In the event of a Constructive Total Loss (damage exceeding 75% of IDV) or total vehicle theft, this endorsement reimburses the gap between the vehicle Insured Declared Value (IDV) and its original on-road purchase invoice price, including registration fees and road taxes.",
        "applicableClaimType": "Both",
        "conditions": [
            "Applicable only on first-time vehicle owners for vehicles within 3 years of first purchase.",
            "Triggered exclusively upon certified Constructive Total Loss (CTL) or unrepaired total theft.",
            "Original vehicle purchase invoice and RTO road tax receipt must be furnished."
        ],
        "evidenceRequired": "RTI endorsement certificate, original vehicle dealer purchase invoice, original road tax receipt, and CTL assessment report.",
        "category": "Add-on Cover",
        "description": "Bridges the gap between depreciated IDV and original on-road invoice price on total loss or theft.",
        "standardDeductionOrRule": "Full original invoice indemnity without standard depreciation deductions.",
        "appliesTo": "Both",
        "riskWeight": "HIGH"
    }
]
